import crypto from "crypto";
import { put, query } from "../../shared/services/db-client.service.js";
import { requireEnv } from "../../shared/helpers/env.helper.js";
import { ConflictError } from "../../shared/helpers/error.helper.js";
import { ActiveSessionItem } from "../../shared/types/workout.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");

export async function startSessionLogic(userId: string) {
    const existing = await query<ActiveSessionItem>(
        { pkName: "UserId", pk: userId },
        ACTIVE_SESSIONS_TABLE_NAME,
    );

    if (existing.length > 0) {
        throw new ConflictError("User already has an active session.", {
            sessionId: existing[0].SessionId,
        });
    }

    const sessionId = crypto.randomUUID();
    const ttl = Date.now() / 1000 + 8 * 3600;

    await put(
        {
            UserId: userId,
            SessionId: sessionId,
            TimeToExist: ttl,
            StartTime: new Date().toISOString(),
        },
        ACTIVE_SESSIONS_TABLE_NAME,
    );

    return sessionId;
}
