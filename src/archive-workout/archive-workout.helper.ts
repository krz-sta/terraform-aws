import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { saveWorkoutSnapshot } from "./archive-workout.service.js";
import { SQSEvent, DynamoDBRecord } from "aws-lambda";

const collectWorkoutRecords = (event: SQSEvent) => {
    const workoutRecords: DynamoDBRecord[] = [];

    for (const record of event.Records ?? []) {
        const sqsMessage = JSON.parse(record.body);
        const snsMessage =
            typeof sqsMessage.Message === "string"
                ? JSON.parse(sqsMessage.Message)
                : sqsMessage.Message;

        if (Array.isArray(snsMessage?.Records)) {
            workoutRecords.push(...snsMessage.Records);
        } else if (snsMessage) {
            workoutRecords.push(snsMessage);
        }
    }

    return workoutRecords;
};

const buildWorkoutArchiveKey = (
    UserId: string,
    StartTime: string,
    SessionId: string,
) => {
    const startDate = new Date(StartTime ?? Date.now());

    return `${UserId}/${startDate.getFullYear()}/${startDate.getMonth() + 1}/${startDate.getDate()}/${SessionId}.json`;
};

export const archiveWorkoutSnapshots = async (event: SQSEvent) => {
    for (const record of collectWorkoutRecords(event)) {
        const newImage = record.dynamodb?.NewImage;

        if (!newImage) {
            continue;
        }

        const workout = unmarshall(newImage as Record<string, AttributeValue>);
        const fileKey = buildWorkoutArchiveKey(
            workout.UserId,
            workout.StartTime,
            workout.SessionId,
        );

        console.log("Saving workout snapshot to S3 with key:", fileKey);

        await saveWorkoutSnapshot(fileKey, workout);
    }
};
