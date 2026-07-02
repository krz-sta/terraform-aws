import {
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../helpers/db-client.helper.js";

export const get = async (
    partitionKeyName: string,
    partitionKey: string,
    sortKeyName: string,
    sortKey: string,
    tableName: string,
) => {
    console.log(
        `Getting item: PK: ${partitionKey}, SK: ${sortKey} from ${tableName}`,
    );
    const result = await docClient.send(
        new GetCommand({
            TableName: tableName,
            Key: {
                [partitionKeyName]: partitionKey,
                [sortKeyName]: sortKey,
            },
        }),
    );
    console.log(`Result from get: ${JSON.stringify(result.Item, null, 2)}`);
    return result.Item || null;
};

export const update = async (
    partitionKeyName: string,
    partitionKey: string,
    sortKeyName: string,
    sortKey: string,
    attribute: string,
    updatedData: string,
    tableName: string,
) => {
    console.log(
        `Updating ${attribute} in item: PK: ${partitionKey}, SK: ${sortKey} in ${tableName} with: ${updatedData}`,
    );
    await docClient.send(
        new UpdateCommand({
            TableName: tableName,
            Key: {
                [partitionKeyName]: partitionKey,
                [sortKeyName]: sortKey,
            },
            UpdateExpression: "SET #attribute = :updatedData",
            ExpressionAttributeNames: {
                "#attribute": attribute,
            },
            ExpressionAttributeValues: {
                ":updatedData": updatedData,
            },
        }),
    );
};

export const deleteCmd = async (
    partitionKeyName: string,
    partitionKey: string,
    sortKeyName: string,
    sortKey: string,
    tableName: string,
) => {
    console.log(
        `Deleting item: PK: ${partitionKey}, SK: ${sortKey} from ${tableName}`,
    );
    await docClient.send(
        new DeleteCommand({
            TableName: tableName,
            Key: {
                [partitionKeyName]: partitionKey,
                [sortKeyName]: sortKey,
            },
            ConditionExpression:
                "attribute_exists(#partitionKey) AND attribute_exists(#sortKey)",
            ExpressionAttributeNames: {
                "#partitionKey": partitionKeyName,
                "#sortKey": sortKeyName,
            },
        }),
    );
};

export const queryNoSk = async (
    partitionKeyName: string,
    partitionKey: string,
    tableName: string,
) => {
    console.log(`Querying items: PK: ${partitionKey} from ${tableName}`);
    const result = await docClient.send(
        new QueryCommand({
            TableName: tableName,
            KeyConditionExpression: `${partitionKeyName} = :partitionKey`,
            ExpressionAttributeValues: {
                ":partitionKey": partitionKey,
            },
        }),
    );
    console.log(`Result from query: ${JSON.stringify(result.Items, null, 2)}`);
    return result.Items || [];
};
