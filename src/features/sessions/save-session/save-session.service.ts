import { transactWrite } from "../../shared/services/db-client.service.js";
import { requireEnv } from "../../shared/helpers/env.helper.js";
import { SessionHistoryItem } from "../../shared/types/workout.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");
const SESSION_HISTORY_TABLE_NAME = requireEnv("SESSION_HISTORY_TABLE_NAME");

export async function saveSession(sessionData: SessionHistoryItem) {
    await transactWrite([
        {
            type: "put",
            tableName: SESSION_HISTORY_TABLE_NAME,
            item: sessionData,
        },
        {
            type: "delete",
            tableName: ACTIVE_SESSIONS_TABLE_NAME,
            key: {
                pkName: "UserId",
                pk: sessionData.UserId,
                skName: "SessionId",
                sk: sessionData.SessionId,
            },
        },
    ]);
}
