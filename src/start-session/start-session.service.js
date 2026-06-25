import { docClient } from "../helpers/dbClient.js";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;

export const querySessionByUserId = async (userId) => {
    const existing = await docClient.send(
        new QueryCommand({
            TableName: "DBActiveSessions",
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
            TableName: "DBActiveSessions",
            Item: {
                UserId: userId,
                SessionId: sessionId,
                TimeToExist: ttl,
                StartTime: new Date().toISOString(),
            },
        }),
    );
};
