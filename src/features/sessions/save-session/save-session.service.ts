import { transactWrite } from "../../shared/services/db-client.service.js";
import { requireEnv } from "../../shared/helpers/env.helper.js";
import { SessionHistoryItem } from "../../shared/types/workout.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");
const SESSION_HISTORY_TABLE_NAME = requireEnv("SESSION_HISTORY_TABLE_NAME");

export async function saveSession(sessionData: SessionHistoryItem) {
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
