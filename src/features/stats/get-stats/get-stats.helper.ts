import { requireEnv } from "../../shared/helpers/env.helper.js";
import { query } from "../../shared/services/db-client.service.js";
import { UserStatItem } from "../../shared/types/workout.js";
import { logger } from "../../shared/services/logger.service.js";

const USER_STATS_TABLE_NAME = requireEnv("USER_STATS_TABLE_NAME");

export async function getStatsLogic(userId: string) {
    logger.info("Querying stats", {
        userId,
        tableName: USER_STATS_TABLE_NAME,
    });
    const stats = await query<UserStatItem>(
        {
            pkName: "UserId",
            pk: userId,
        },
        USER_STATS_TABLE_NAME,
    );

    const result: {
        total: Record<string, unknown>;
        exercises: Record<string, Record<string, unknown>>;
    } = {
        total: {},
        exercises: {},
    };

    for (const stat of stats) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { SK, UserId: _userId, ...payload } = stat;

        if (SK === "STAT#TOTAL") {
            result.total = payload;
        } else if (SK.startsWith("EX#")) {
            const exerciseName = SK.replace("EX#", "");
            result.exercises[exerciseName] = payload;
        }
    }

    return result;
}
