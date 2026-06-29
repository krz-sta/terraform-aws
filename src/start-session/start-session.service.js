import { docClient } from "../helpers/db-client.helper";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;

export const querySessionByUserId = async (userId) => {
    const existing = await docClient.send(
        new QueryCommand({
            TableName: ACTIVE_SESSIONS_TABLE_NAME,
            KeyConditionExpression: "UserId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
        }),
    );

    return existing.Items[0] || null;
};

export const startSession = async (userId, sessionId, ttl) => {
    await docClient.send(
        new PutCommand({
            TableName: ACTIVE_SESSIONS_TABLE_NAME,
            Item: {
                UserId: userId,
                SessionId: sessionId,
                TimeToExist: ttl,
                StartTime: new Date().toISOString(),
            },
        }),
    );
};
