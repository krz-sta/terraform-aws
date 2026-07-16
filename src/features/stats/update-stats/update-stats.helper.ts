import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SQSEvent, SQSRecord } from "aws-lambda";
import { add, get, update } from "../../shared/services/db-client.service.js";
import { UserStatItem } from "../../shared/types/workout.js";
import { requireEnv } from "../../shared/helpers/env.helper.js";
import type { DynamoDbStreamRecord } from "../../shared/types/events.js";
import type {
    ExerciseData,
    ParsedSessionData,
    SessionStatsInput,
    SetLike,
} from "../../shared/types/stats.js";

const USER_STATS_TABLE_NAME = requireEnv("USER_STATS_TABLE_NAME");

function parseJson(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
}

function hasRecordsProperty(
    value: Record<string, unknown>,
): value is { Records: unknown[] } {
    return "Records" in value && Array.isArray(value.Records);
}

function isDynamoDbRecord(value: unknown): value is DynamoDbStreamRecord {
    if (!isRecord(value)) return false;
    if (!("dynamodb" in value)) return true;

    const dynamodb = value.dynamodb;
    if (!isRecord(dynamodb)) return false;
    if (!("NewImage" in dynamodb)) return true;

    return isRecord(dynamodb.NewImage);
}

function getDbRecords(payload: unknown): DynamoDbStreamRecord[] {
    if (!isRecord(payload)) return [];

    if (hasRecordsProperty(payload)) {
        return payload.Records.filter(isDynamoDbRecord);
    }

    return isDynamoDbRecord(payload) ? [payload] : [];
}

function unwrapSnsMessage(sqsBody: unknown): unknown {
    if (!isRecord(sqsBody) || !("Message" in sqsBody)) {
        return sqsBody;
    }

    const nestedMessage = sqsBody.Message;
    return typeof nestedMessage === "string"
        ? parseJson(nestedMessage)
        : nestedMessage;
}

function isParsedSessionData(value: unknown): value is ParsedSessionData {
    return (
        isRecord(value) &&
        typeof value.UserId === "string" &&
        isRecord(value.Exercises)
    );
}

function parseDbRecords(record: SQSRecord): DynamoDbStreamRecord[] {
    const sqsBody = parseJson(record.body);
    const message = unwrapSnsMessage(sqsBody);
    return getDbRecords(message);
}

export function buildSessionsForStats(event: SQSEvent): SessionStatsInput[] {
    const sessions: SessionStatsInput[] = [];

    for (const record of event.Records ?? []) {
        for (const dbRecord of parseDbRecords(record)) {
            const newImage = dbRecord.dynamodb?.NewImage;
            if (!newImage) continue;

            const sessionData = unmarshall(newImage);
            if (!isParsedSessionData(sessionData)) continue;

            sessions.push({
                userId: sessionData.UserId,
                exercises: sessionData.Exercises,
            });
        }
    }

    return sessions;
}

function normalizeSets(exerciseData: ExerciseData): SetLike[] {
    if (Array.isArray(exerciseData?.Sets)) {
        return exerciseData.Sets;
    }

    if (Array.isArray(exerciseData?.sets)) {
        return exerciseData.sets;
    }

    return [];
}

function getSetWeight(set: SetLike) {
    return Number(set.Weight ?? set.weight ?? 0);
}

function getSetReps(set: SetLike) {
    return Number(set.Reps ?? set.reps ?? 0);
}

function getNumericStat(
    stats: Record<string, unknown> | null,
    key: string,
): number {
    const value = stats?.[key];
    return typeof value === "number" ? value : 0;
}

async function processExercise(
    userId: string,
    exerciseName: string,
    exerciseData: ExerciseData,
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

    const existingStats = await get<UserStatItem>(
        {
            pkName: "UserId",
            pk: userId,
            skName: "SK",
            sk: sortKey,
        },
        USER_STATS_TABLE_NAME,
    );

    const nextStats = hasWeightedSet
        ? {
              Best1RM: Math.max(
                  getNumericStat(existingStats, "Best1RM"),
                  sessionBest1RM,
              ),
              BestVolume: Math.max(
                  getNumericStat(existingStats, "BestVolume"),
                  sessionBestVolume,
              ),
              BestWeight: Math.max(
                  getNumericStat(existingStats, "BestWeight"),
                  sessionBestWeight,
              ),
          }
        : {
              MaxReps: Math.max(
                  getNumericStat(existingStats, "MaxReps"),
                  sessionMaxReps,
              ),
          };

    await update(
        {
            pkName: "UserId",
            pk: userId,
            skName: "SK",
            sk: sortKey,
        },
        nextStats,
        USER_STATS_TABLE_NAME,
    );

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

        await add(
            {
                pkName: "UserId",
                pk: session.userId,
                skName: "SK",
                sk: "STAT#TOTAL",
            },
            {
                TotalWorkouts: 1,
                TotalVolume: globalVolume,
                TotalReps: globalReps,
            },
            USER_STATS_TABLE_NAME,
        );
    }
}
