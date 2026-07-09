import { NotFoundError } from "../../shared/helpers/error.helper.js";
import { requireEnv } from "../../shared/helpers/env.helper.js";
import { get } from "../../shared/services/db-client.service.js";
import { ActiveSessionItem } from "../../shared/types/workout.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");

export async function getSessionLogic(userId: string, sessionId: string) {
    const session = await get<ActiveSessionItem>(
        {
            pkName: "UserId",
            pk: userId,
            skName: "SessionId",
            sk: sessionId,
        },
        ACTIVE_SESSIONS_TABLE_NAME,
    );

    if (!session) {
        throw new NotFoundError("Session not found.");
    }

    return session;
}
