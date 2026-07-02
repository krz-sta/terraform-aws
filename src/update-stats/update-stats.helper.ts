import { unmarshall } from "@aws-sdk/util-dynamodb";
import { get } from "../services/db-client.service.js";
import {
    updateExerciseStats,
    updateGlobalStats,
} from "./update-stats.service.js";
import { SetData } from "../types/SetData.js";
import { SQSEvent } from "aws-lambda/trigger/sqs.js";

const USER_STATS_TABLE_NAME = process.env.USER_STATS_TABLE_NAME;

if (!USER_STATS_TABLE_NAME) {
    throw new Error("Missing environment variable.");
}

const normalizeSets = (exerciseData: any) => {
    if (Array.isArray(exerciseData?.Sets)) {
        return exerciseData.Sets;
    }

    if (Array.isArray(exerciseData?.sets)) {
        return exerciseData.sets;
    }

    return [];
};

const getSetWeight = (set: SetData) => Number(set.Weight ?? set.weight ?? 0);

const getSetReps = (set: SetData) => Number(set.Reps ?? set.reps ?? 0);

const processExercise = async (
    userId: string,
    exerciseName: string,
    exerciseData: any,
) => {
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

    const existingStats = await get(
        "UserId",
        userId,
        "SK",
        sortKey,
        USER_STATS_TABLE_NAME,
    );

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

    await updateExerciseStats(
        userId,
        sortKey,
        nextStats,
        USER_STATS_TABLE_NAME,
    );

    return { exVolume: sessionVolume, exReps: sessionReps };
};

export const calculateSessionStats = async (event: SQSEvent) => {
    for (const record of event.Records) {
        const sqsBody = JSON.parse(record.body);
        const message = JSON.parse(sqsBody.Message);
        const dbRecords = Array.isArray(message.Records)
            ? message.Records
            : [message];

        for (const dbRecord of dbRecords) {
            const sessionData = unmarshall(dbRecord.dynamodb.NewImage);
            const userId = sessionData.UserId;
            const exercises = sessionData.Exercises;

            let globalVolume = 0;
            let globalReps = 0;
            const dbPromises = [];

            for (const [exerciseName, exerciseData] of Object.entries(
                exercises,
            )) {
                const exerciseTask = processExercise(
                    userId,
                    exerciseName,
                    exerciseData,
                ).then(({ exVolume, exReps }) => {
                    globalVolume += exVolume;
                    globalReps += exReps;
                });

                dbPromises.push(exerciseTask);
            }

            await Promise.all(dbPromises);

            await updateGlobalStats(
                userId,
                globalVolume,
                globalReps,
                USER_STATS_TABLE_NAME,
            );
        }
    }
};
