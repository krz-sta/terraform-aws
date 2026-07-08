import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SQSEvent } from "aws-lambda/trigger/sqs.js";
import { archiveWorkoutSnapshots } from "./archive-workout.helper.js";
import { WorkoutSnapshot } from "./archive-workout.service.js";

const collectWorkoutSnapshots = (event: SQSEvent): WorkoutSnapshot[] => {
    const snapshots = [];

    for (const record of event.Records ?? []) {
        const sqsMessage = JSON.parse(record.body);
        const snsMessage =
            typeof sqsMessage.Message === "string"
                ? JSON.parse(sqsMessage.Message)
                : sqsMessage.Message;
        const dbRecords = Array.isArray(snsMessage?.Records)
            ? snsMessage.Records
            : snsMessage
              ? [snsMessage]
              : [];

        for (const dbRecord of dbRecords) {
            const newImage = dbRecord?.dynamodb?.NewImage;
            if (!newImage) {
                continue;
            }

            const workout = unmarshall(
                newImage as Record<string, AttributeValue>,
            );
            if (!workout?.UserId || !workout?.SessionId) {
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
