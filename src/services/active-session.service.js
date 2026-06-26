import crypto from "crypto";
import { docClient } from "../helpers/db-client.helper.js";
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

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

export const updateSession = async (userId, sessionId, updatedExercises) => {
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
};
