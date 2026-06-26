import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
    DynamoDBDocumentClient,
    GetCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

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

await get(
    "UserId",
    "krzysztof123",
    "SessionId",
    "4f010870-8117-432d-9ff4-ea2022743178",
    "DBActiveSessions",
);
