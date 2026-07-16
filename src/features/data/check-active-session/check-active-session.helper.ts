import { requireEnv } from "../../shared/helpers/env.helper.js";
import { query } from "../../shared/services/db-client.service.js";
import type { CheckActiveSessionResult } from "../../shared/types/data.js";
import { ActiveSessionItem } from "../../shared/types/workout.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");

export async function checkActiveSession(
    userId: string,
): Promise<CheckActiveSessionResult> {
    const sessions = await query<ActiveSessionItem>(
        { pkName: "UserId", pk: userId },
        ACTIVE_SESSIONS_TABLE_NAME,
        { limit: 1 },
    );

    return {
        userId,
        hasActiveSession: sessions.length > 0,
    };
}
