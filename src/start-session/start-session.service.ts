import { requireEnv } from "../helpers/env.helper.js";
import { put, query } from "../services/db-client.service.js";
import { ActiveSessionItem } from "../types/workout.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");

export async function querySessionByUserId(userId: string) {
    const existing = await query<ActiveSessionItem>(
        {
            pkName: "UserId",
            pk: userId,
        },
        ACTIVE_SESSIONS_TABLE_NAME,
    );

    return existing[0] || null;
}

export async function startSession(
    userId: string,
    sessionId: string,
    ttl: number,
) {
    await put(
        {
            UserId: userId,
            SessionId: sessionId,
            TimeToExist: ttl,
            StartTime: new Date().toISOString(),
        },
        ACTIVE_SESSIONS_TABLE_NAME,
    );
}
