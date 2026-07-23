import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SQSEvent, SQSRecord } from "aws-lambda/trigger/sqs.js";
import { saveWorkoutSnapshot } from "./archive-workout.service.js";
import type { WorkoutSnapshot } from "../../shared/types/archive.js";
import {
    isRecord,
    parseDbRecordsFromSqs,
} from "../../shared/helpers/stream-parser.helper.js";
import { logger } from "../../shared/services/logger.service.js";

function isValidWorkoutSnapshot(value: unknown): value is WorkoutSnapshot {
    if (!isRecord(value)) return false;

    const required = {
        UserId: "string",
        SessionId: "string",
        StartTime: "string",
        EndTime: "string",
        TimeToExist: "number",
    };

    for (const [key, type] of Object.entries(required)) {
        if (typeof value[key] !== type) return false;
    }

    return true;
}

function extractSnapshots(record: SQSRecord): WorkoutSnapshot[] {
    const dbRecords = parseDbRecordsFromSqs(record);

    const snapshots: WorkoutSnapshot[] = [];

    for (const dbRecord of dbRecords) {
        const newImage = dbRecord.dynamodb?.NewImage;
        if (!newImage) continue;

        const unmarshalled = unmarshall(newImage);
        if (!isValidWorkoutSnapshot(unmarshalled)) continue;

        snapshots.push({
            UserId: unmarshalled.UserId,
            SessionId: unmarshalled.SessionId,
            StartTime: unmarshalled.StartTime,
            EndTime: unmarshalled.EndTime,
            TimeToExist: unmarshalled.TimeToExist,
            Exercises: unmarshalled.Exercises,
        });
    }

    return snapshots;
}

export function collectWorkoutSnapshots(event: SQSEvent): WorkoutSnapshot[] {
    return event.Records?.flatMap(extractSnapshots) ?? [];
}

function buildWorkoutArchiveKey(
    UserId: string,
    StartTime: string,
    SessionId: string,
) {
    const startDate = new Date(StartTime ?? Date.now());

    return `${UserId}/${startDate.getFullYear()}/${startDate.getMonth() + 1}/${startDate.getDate()}/${SessionId}.parquet`;
}

export async function archiveWorkoutSnapshots(workouts: WorkoutSnapshot[]) {
    for (const workout of workouts) {
        const fileKey = buildWorkoutArchiveKey(
            workout.UserId,
            workout.StartTime,
            workout.SessionId,
        );

        logger.info("Saving workout snapshot to S3", { fileKey });

        await saveWorkoutSnapshot(fileKey, workout);
    }
}
