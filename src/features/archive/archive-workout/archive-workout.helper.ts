import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SQSEvent, SQSRecord } from "aws-lambda/trigger/sqs.js";
import {
    saveWorkoutSnapshot,
    WorkoutSnapshot,
} from "./archive-workout.service.js";

type DynamoDbRecord = {
    dynamodb?: {
        NewImage?: Record<string, AttributeValue>;
    };
};

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

function isDynamoDbRecord(value: unknown): value is DynamoDbRecord {
    if (!isRecord(value)) return false;
    if (!("dynamodb" in value)) return true;

    const dynamodb = value.dynamodb;
    if (!isRecord(dynamodb)) return false;
    if (!("NewImage" in dynamodb)) return true;

    return isRecord(dynamodb.NewImage);
}

function getDbRecords(payload: unknown): DynamoDbRecord[] {
    if (!isRecord(payload)) return [];

    if (hasRecordsProperty(payload)) {
        return payload.Records.filter(isDynamoDbRecord);
    }

    return isDynamoDbRecord(payload) ? [payload] : [];
}

function unwrapSnsMessage(sqsMessage: unknown): unknown {
    if (!isRecord(sqsMessage) || !("Message" in sqsMessage)) {
        return sqsMessage;
    }

    const nestedMessage = sqsMessage.Message;
    return typeof nestedMessage === "string"
        ? parseJson(nestedMessage)
        : nestedMessage;
}

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
    const sqsMessage = parseJson(record.body);
    const snsMessage = unwrapSnsMessage(sqsMessage);
    const dbRecords = getDbRecords(snsMessage);

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

        console.log("Saving workout snapshot to S3 with key:", fileKey);

        await saveWorkoutSnapshot(fileKey, workout);
    }
}
