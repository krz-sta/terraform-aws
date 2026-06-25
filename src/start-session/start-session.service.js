import { docClient } from "../helpers/dbClient.js";
import { QueryCommand, PutCommand } from "@aws-sdk/lib-dynamodb";

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

export const startSession = async (userId, sessionId) => {
    const ttl = Math.floor(Date.now() / 100) + 8 * 3600;

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
