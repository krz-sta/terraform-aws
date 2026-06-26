import { docClient } from "../helpers/dbClient.js";
import { GetCommand } from "@aws-sdk/lib-dynamodb";

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
