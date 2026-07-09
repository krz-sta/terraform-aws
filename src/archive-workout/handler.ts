import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SQSEvent } from "aws-lambda/trigger/sqs.js";
import { archiveWorkoutSnapshots } from "./archive-workout.helper.js";
import { WorkoutSnapshot } from "./archive-workout.service.js";

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

const collectWorkoutSnapshots = (event: SQSEvent): WorkoutSnapshot[] => {
    const snapshots = [];

    for (const record of event.Records ?? []) {
        const sqsMessage = parseJson(record.body);

        let snsMessage: unknown = sqsMessage;
        if (isRecord(sqsMessage) && "Message" in sqsMessage) {
            const nestedMessage = sqsMessage.Message;
            snsMessage =
                typeof nestedMessage === "string"
                    ? parseJson(nestedMessage)
                    : nestedMessage;
        }

        const dbRecords = getDbRecords(snsMessage);

        for (const dbRecord of dbRecords) {
            const newImage = dbRecord?.dynamodb?.NewImage;
            if (!newImage) {
                continue;
            }

            const workout = unmarshall(newImage) as Partial<WorkoutSnapshot>;
            if (
                !workout.UserId ||
                !workout.SessionId ||
                typeof workout.StartTime !== "string" ||
                typeof workout.EndTime !== "string" ||
                typeof workout.TimeToExist !== "number"
            ) {
                continue;
            }

            snapshots.push({
                UserId: workout.UserId,
                SessionId: workout.SessionId,
                StartTime: workout.StartTime,
                EndTime: workout.EndTime,
                TimeToExist: workout.TimeToExist,
                Exercises: workout.Exercises,
            });
        }
    }

    return snapshots;
};

export const handler = async (event: SQSEvent) => {
    try {
        const snapshots = collectWorkoutSnapshots(event);
        await archiveWorkoutSnapshots(snapshots);
    } catch (e) {
        console.error("Error archiving workout snapshots:", e);
        throw e;
    }
};
