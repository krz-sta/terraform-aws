import { unmarshall } from "@aws-sdk/util-dynamodb";
import { saveWorkoutSnapshot } from "./archive-workout.service.js";

const collectWorkoutRecords = (event) => {
    const workoutRecords = [];

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

const buildWorkoutArchiveKey = ({ UserId, SessionId, StartTime }) => {
    const startDate = new Date(StartTime ?? Date.now());

    return `${UserId}/${startDate.getFullYear()}/${startDate.getMonth() + 1}/${startDate.getDate()}/${SessionId}.json`;
};

export const archiveWorkoutSnapshots = async (event) => {
    for (const record of collectWorkoutRecords(event)) {
        const workout = unmarshall(record.dynamodb.NewImage);
        const fileKey = buildWorkoutArchiveKey(workout);

        console.log("Saving workout snapshot to S3 with key:", fileKey);

        await saveWorkoutSnapshot(fileKey, workout);
    }
};
