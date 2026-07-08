import { NotFoundError } from "../helpers/error.helper.js";
import { requireEnv } from "../helpers/env.helper.js";
import { delete as deleteItem } from "../services/db-client.service.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");

export async function cancelSessionLogic(userId: string, sessionId: string) {
    try {
        await deleteItem(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SessionId",
                sk: sessionId,
            },
            ACTIVE_SESSIONS_TABLE_NAME,
        );
    } catch (e: any) {
        if (e.name === "ConditionalCheckFailedException") {
            throw new NotFoundError("Session not found.");
        }
        throw e;
    }
}
