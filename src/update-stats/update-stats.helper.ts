import {
    getUserExerciseStats,
    updateExerciseStats,
    updateGlobalStats,
} from "./update-stats.service.js";
import { SetData } from "../types/SetData.js";

export type SessionStatsInput = {
    userId: string;
    exercises: Record<string, any>;
};

function normalizeSets(exerciseData: any) {
    if (Array.isArray(exerciseData?.Sets)) {
        return exerciseData.Sets;
    }

    if (Array.isArray(exerciseData?.sets)) {
        return exerciseData.sets;
    }

    return [];
}

function getSetWeight(set: SetData) {
    return Number(set.Weight ?? set.weight ?? 0);
}

function getSetReps(set: SetData) {
    return Number(set.Reps ?? set.reps ?? 0);
}

async function processExercise(
    userId: string,
    exerciseName: string,
    exerciseData: any,
) {
    let sessionVolume = 0;
    let sessionReps = 0;
    let sessionMaxReps = 0;
    let sessionBest1RM = 0;
    let sessionBestVolume = 0;
    let sessionBestWeight = 0;
    let hasWeightedSet = false;

    for (const set of normalizeSets(exerciseData)) {
        const weight = getSetWeight(set);
        const reps = getSetReps(set);

        sessionReps += reps;

        if (reps > sessionMaxReps) {
            sessionMaxReps = reps;
        }

        if (weight > 0 && reps > 0) {
            hasWeightedSet = true;

            const volume = weight * reps;
            sessionVolume += volume;

            if (volume > sessionBestVolume) {
                sessionBestVolume = volume;
            }

            if (weight > sessionBestWeight) {
                sessionBestWeight = weight;
            }

            const current1RM = weight * (1 + reps / 30);
            if (current1RM > sessionBest1RM) {
                sessionBest1RM = current1RM;
            }
        }
    }

    sessionBest1RM = Math.round(sessionBest1RM * 100) / 100;
    sessionBestVolume = Math.round(sessionBestVolume * 100) / 100;
    const sortKey = `EX#${exerciseName}`;

    const existingStats = await getUserExerciseStats(userId, sortKey);

    const nextStats = hasWeightedSet
        ? {
              Best1RM: Math.max(existingStats?.Best1RM || 0, sessionBest1RM),
              BestVolume: Math.max(
                  existingStats?.BestVolume || 0,
                  sessionBestVolume,
              ),
              BestWeight: Math.max(
                  existingStats?.BestWeight || 0,
                  sessionBestWeight,
              ),
          }
        : {
              MaxReps: Math.max(existingStats?.MaxReps || 0, sessionMaxReps),
          };

    await updateExerciseStats(userId, sortKey, nextStats);

    return { exVolume: sessionVolume, exReps: sessionReps };
}

export async function calculateSessionStats(sessions: SessionStatsInput[]) {
    for (const session of sessions) {
        let globalVolume = 0;
        let globalReps = 0;
        const dbPromises = [];

        for (const [exerciseName, exerciseData] of Object.entries(
            session.exercises,
        )) {
            const exerciseTask = processExercise(
                session.userId,
                exerciseName,
                exerciseData,
            ).then(({ exVolume, exReps }) => {
                globalVolume += exVolume;
                globalReps += exReps;
            });

            dbPromises.push(exerciseTask);
        }

        await Promise.all(dbPromises);

        await updateGlobalStats(session.userId, globalVolume, globalReps);
    }
}
