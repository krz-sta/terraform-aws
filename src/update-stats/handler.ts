import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SQSEvent } from "aws-lambda";
import { calculateSessionStats } from "./update-stats.helper.js";
import { ExercisesMap } from "../types/workout.js";

type DynamoDbRecord = {
    dynamodb?: {
        NewImage?: Record<string, AttributeValue>;
    };
};

type ParsedSessionData = {
    UserId: string;
    Exercises: ExercisesMap;
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

function getDbRecords(payload: unknown): DynamoDbRecord[] {
    if (!isRecord(payload)) {
        return [];
    }

    const recordsCandidate = payload.Records;
    if (Array.isArray(recordsCandidate)) {
        return recordsCandidate as DynamoDbRecord[];
    }

    return [payload as DynamoDbRecord];
}

const parseDbRecords = (event: SQSEvent): DynamoDbRecord[] => {
    const dbRecords: DynamoDbRecord[] = [];

    for (const record of event.Records ?? []) {
        const sqsBody = parseJson(record.body);

        let message: unknown = sqsBody;
        if (isRecord(sqsBody) && "Message" in sqsBody) {
            const nestedMessage = sqsBody.Message;
            message =
                typeof nestedMessage === "string"
                    ? parseJson(nestedMessage)
                    : nestedMessage;
        }

        const records = getDbRecords(message);

        dbRecords.push(...records);
    }

    return dbRecords;
};

const buildSessionsForStats = (event: SQSEvent) => {
    const sessions: Array<{ userId: string; exercises: ExercisesMap }> = [];

    for (const dbRecord of parseDbRecords(event)) {
        const newImage = dbRecord?.dynamodb?.NewImage;
        if (!newImage) {
            continue;
        }

        const sessionData = unmarshall(newImage) as Partial<ParsedSessionData>;
        if (!sessionData.UserId || !sessionData.Exercises) {
            continue;
        }

        sessions.push({
            userId: sessionData.UserId,
            exercises: sessionData.Exercises,
        });
    }

    return sessions;
};

export const handler = async (event: SQSEvent) => {
    try {
        const sessions = buildSessionsForStats(event);
        await calculateSessionStats(sessions);
    } catch (e) {
        console.error("Error processing SQS event:", e);
        throw e;
    }
};
