import crypto from "crypto";
import { docClient } from "../helpers/dbClient.js";
import {
    GetCommand,
    DeleteCommand,
    PutCommand,
    QueryCommand,
    TransactWriteCommand,
    UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

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

export async function getSession(userId, sessionId) {
    const result = await docClient.send(
        new GetCommand({
            TableName: "DBActiveSessions",
            Key: {
                UserId: userId,
                SessionId: sessionId,
            },
        }),
    );

    return result.Item || null;
}

export async function deleteSession(userId, sessionId) {
    await docClient.send(
        new DeleteCommand({
            TableName: "DBActiveSessions",
            Key: {
                UserId: userId,
                SessionId: sessionId,
            },
            ConditionExpression: "attribute_exists(SessionId)",
        }),
    );
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

export async function updateSession(userId, sessionId, updatedExercises) {
    await docClient.send(
        new UpdateCommand({
            TableName: "DBActiveSessions",
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
