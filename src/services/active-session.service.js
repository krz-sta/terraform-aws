import crypto from "crypto";
import { docClient } from "../helpers/db-client.helper.js";
import {
    GetCommand,
    DeleteCommand,
    PutCommand,
    QueryCommand,
    TransactWriteCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;

export const getSessionByIds = async (userId, sessionId) => {
    const session = await docClient.send(
        new GetCommand({
            TableName: ACTIVE_SESSIONS_TABLE_NAME,
            Key: {
                UserId: userId,
                SessionId: sessionId,
            },
        }),
    );

    return session.Item || null;
};

export async function updateSession(userId, sessionId, updatedExercises) {
    await docClient.send(
        new UpdateCommand({
            TableName: ACTIVE_SESSIONS_TABLE_NAME,
            Key: {
                UserId: userId,
                SessionId: sessionId,
            },
            UpdateExpression: "SET Exercises = :updatedData",
            ExpressionAttributeValues: {
                ":updatedData": updatedExercises,
            },
        }),
    );
}

export async function querySession(userId) {
    const existing = await docClient.send(
        new QueryCommand({
            TableName: "DBActiveSessions",
            KeyConditionExpression: "UserId = :userId",
            ExpressionAttributeValues: {
                ":userId": userId,
            },
        }),
    );

    return existing.Items?.length > 0 ? existing.Items[0] : null;
}

export async function putSession(userId) {
    const sessionId = crypto.randomUUID();
    const ttl = Math.floor(Date.now() / 1000) + 8 * 3600; // 8 hours

    await docClient.send(
        new PutCommand({
            TableName: "DBActiveSessions",
            Item: {
                UserId: userId,
                SessionId: sessionId,
                TimeToExist: ttl,
                startTime: new Date().toISOString(),
            },
        }),
    );

    return sessionId;
}

export async function saveSession(sessionData) {
    await docClient.send(
        new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: "DBSessionHistory",
                        Item: sessionData,
                    },
                },
                {
                    Delete: {
                        TableName: "DBActiveSessions",
                        Key: {
                            UserId: sessionData.UserId,
                            SessionId: sessionData.SessionId,
                        },
                        ConditionExpression:
                            "attribute_exists(UserId) AND attribute_exists(SessionId)",
                    },
                },
            ],
        }),
    );
}
