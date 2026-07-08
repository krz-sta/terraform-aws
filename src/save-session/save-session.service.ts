import { transactWrite } from "../services/db-client.service.js";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;
const SESSION_HISTORY_TABLE_NAME = process.env.SESSION_HISTORY_TABLE_NAME;

if (!ACTIVE_SESSIONS_TABLE_NAME || !SESSION_HISTORY_TABLE_NAME) {
    throw new Error("Missing environment variables.");
}

export async function saveSession(sessionData: any) {
    await transactWrite([
        {
            Put: {
                TableName: SESSION_HISTORY_TABLE_NAME,
                Item: sessionData,
            },
        },
        {
            Delete: {
                TableName: ACTIVE_SESSIONS_TABLE_NAME,
                Key: {
                    UserId: sessionData.UserId,
                    SessionId: sessionData.SessionId,
                },
                ConditionExpression:
                    "attribute_exists(UserId) AND attribute_exists(SessionId)",
            },
        },
    ]);
}
