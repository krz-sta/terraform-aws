import {
    GetCommand,
    PutCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
    TransactWriteCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../helpers/db-client.helper.js";
import type {
    DbKey,
    QueryOptions,
    TransactWriteOperation,
} from "../types/database.js";

function buildKey(key: DbKey) {
    const normalizedKey: Record<string, string> = {
        [key.pkName]: key.pk,
    };

    const hasSortKey = key.skName !== undefined || key.sk !== undefined;
    if (hasSortKey) {
        if (!key.skName || key.sk === undefined) {
            throw new Error(
                "Sort key name and sort key value must be provided together.",
            );
        }

        normalizedKey[key.skName] = key.sk;
    }

    return normalizedKey;
}

function buildPutInput(item: Record<string, unknown>, tableName: string) {
    return {
        TableName: tableName,
        Item: item,
    };
}

function buildDeleteInput(key: DbKey, tableName: string) {
    const hasSortKey = key.skName !== undefined && key.sk !== undefined;
    const expressionAttributeNames: Record<string, string> = {
        "#partitionKey": key.pkName,
    };

    if (hasSortKey) {
        expressionAttributeNames["#sortKey"] = key.skName as string;
    }

    return {
        TableName: tableName,
        Key: buildKey(key),
        ConditionExpression: hasSortKey
            ? "attribute_exists(#partitionKey) AND attribute_exists(#sortKey)"
            : "attribute_exists(#partitionKey)",
        ExpressionAttributeNames: expressionAttributeNames,
    };
}

export async function get<
    T extends Record<string, unknown> = Record<string, unknown>,
>(key: DbKey, tableName: string) {
    console.log(`Getting item from ${tableName}: ${JSON.stringify(key)}`);
    const result = await docClient.send(
        new GetCommand({
            TableName: tableName,
            Key: buildKey(key),
        }),
    );
    console.log(`Result from get: ${JSON.stringify(result.Item, null, 2)}`);
    return (result.Item as T | undefined) || null;
}

export async function put(item: Record<string, unknown>, tableName: string) {
    await docClient.send(new PutCommand(buildPutInput(item, tableName)));
}

export async function update(
    key: DbKey,
    updatedAttributes: Record<string, unknown>,
    tableName: string,
) {
    const entries = Object.entries(updatedAttributes);
    if (!entries.length) {
        return;
    }

    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};
    const updateParts = entries.map(([attribute, value], index) => {
        const nameToken = `#n${index}`;
        const valueToken = `:v${index}`;

        expressionAttributeNames[nameToken] = attribute;
        expressionAttributeValues[valueToken] = value;

        return `${nameToken} = ${valueToken}`;
    });

    await docClient.send(
        new UpdateCommand({
            TableName: tableName,
            Key: buildKey(key),
            UpdateExpression: `SET ${updateParts.join(", ")}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
        }),
    );
}

export async function add(
    key: DbKey,
    incrementAttributes: Record<string, number>,
    tableName: string,
) {
    const entries = Object.entries(incrementAttributes);
    if (!entries.length) {
        return;
    }

    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, number> = {};
    const addParts = entries.map(([attribute, value], index) => {
        const nameToken = `#a${index}`;
        const valueToken = `:a${index}`;

        expressionAttributeNames[nameToken] = attribute;
        expressionAttributeValues[valueToken] = value;

        return `${nameToken} ${valueToken}`;
    });

    await docClient.send(
        new UpdateCommand({
            TableName: tableName,
            Key: buildKey(key),
            UpdateExpression: `ADD ${addParts.join(", ")}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
        }),
    );
}

async function deleteFn(key: DbKey, tableName: string) {
    await docClient.send(new DeleteCommand(buildDeleteInput(key, tableName)));
}

export { deleteFn as delete };

export async function query<
    T extends Record<string, unknown> = Record<string, unknown>,
>(key: DbKey, tableName: string, options?: QueryOptions) {
    const hasSortKey = key.skName !== undefined && key.sk !== undefined;

    const keyConditionExpression = hasSortKey
        ? `${key.pkName} = :pk AND ${key.skName} = :sk`
        : `${key.pkName} = :pk`;

    const expressionAttributeValues = hasSortKey
        ? {
              ":pk": key.pk,
              ":sk": key.sk,
          }
        : {
              ":pk": key.pk,
          };

    const result = await docClient.send(
        new QueryCommand({
            TableName: tableName,
            IndexName: options?.indexName,
            KeyConditionExpression: keyConditionExpression,
            ExpressionAttributeValues: expressionAttributeValues,
            Limit: options?.limit,
            ScanIndexForward: options?.scanIndexForward,
        }),
    );

    if (!options?.limit && result.LastEvaluatedKey) {
        throw new Error("DynamoDB query exceeded the single-page limit.");
    }

    return (result.Items as T[] | undefined) || [];
}

export async function transactWrite(operations: TransactWriteOperation[]) {
    const transactItems = operations.map((operation) => {
        if (operation.type === "put") {
            return {
                Put: buildPutInput(operation.item, operation.tableName),
            };
        }

        return {
            Delete: buildDeleteInput(operation.key, operation.tableName),
        };
    });

    await docClient.send(
        new TransactWriteCommand({
            TransactItems: transactItems,
        }),
    );
}
