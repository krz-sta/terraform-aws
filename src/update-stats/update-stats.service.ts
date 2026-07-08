import { requireEnv } from "../helpers/env.helper.js";
import { add, get, update } from "../services/db-client.service.js";

const USER_STATS_TABLE_NAME = requireEnv("USER_STATS_TABLE_NAME");

export type ExerciseStatsUpdate = {
    Best1RM?: number;
    BestVolume?: number;
    BestWeight?: number;
    MaxReps?: number;
};

export async function getUserExerciseStats(userId: string, sortKey: string) {
    return get(
        {
            pkName: "UserId",
            pk: userId,
            skName: "SK",
            sk: sortKey,
        },
        USER_STATS_TABLE_NAME,
    );
}

export async function updateExerciseStats(
    userId: string,
    sortKey: string,
    stats: ExerciseStatsUpdate,
) {
    console.log(
        `Updating exercise stats for user: ${userId}, sortKey: ${sortKey} in ${USER_STATS_TABLE_NAME}`,
    );

    await update(
        {
            pkName: "UserId",
            pk: userId,
            skName: "SK",
            sk: sortKey,
        },
        stats,
        USER_STATS_TABLE_NAME,
    );
}

export async function updateGlobalStats(
    userId: string,
    totalVolume: number,
    totalReps: number,
) {
    console.log(
        `Updating global stats for user: ${userId} in ${USER_STATS_TABLE_NAME}`,
    );

    await add(
        {
            pkName: "UserId",
            pk: userId,
            skName: "SK",
            sk: "STAT#TOTAL",
        },
        {
            TotalWorkouts: 1,
            TotalVolume: totalVolume,
            TotalReps: totalReps,
        },
        USER_STATS_TABLE_NAME,
    );
}
