import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    UpdateCommand,
    DeleteCommand,
    QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { docClient } from "../helpers/db-client.helper.js";

export const get = async (
    partitionKeyName,
    partitionKey,
    sortKeyName,
    sortKey,
    tableName,
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
    partitionKeyName,
    partitionKey,
    sortKeyName,
    sortKey,
    attribute,
    updatedData,
    tableName,
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
    partitionKeyName,
    partitionKey,
    sortKeyName,
    sortKey,
    tableName,
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
        }),
    );
};

export const queryNoSk = async (partitionKeyName, partitionKey, tableName) => {
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
