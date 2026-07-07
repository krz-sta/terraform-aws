import { unmarshall } from "@aws-sdk/util-dynamodb";
import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { saveWorkoutSnapshot } from "./archive-workout.service.js";
import { SQSEvent, DynamoDBRecord } from "aws-lambda";
import { ParquetSchema, ParquetWriter } from "@dsnp/parquetjs";
import path from "path";
import crypto from "crypto";
import fs from "fs";

const schema = new ParquetSchema({
    UserId: { type: "UTF8" },
    SessionId: { type: "UTF8" },
    StartTime: { type: "UTF8" },
    EndTime: { type: "UTF8" },
    TimeToExist: { type: "INT64" },
    Exercises: {
        repeated: true,
        fields: {
            name: { type: "UTF8" },
            sets: {
                repeated: true,
                fields: {
                    weight: { type: "DOUBLE" },
                    reps: { type: "INT64" },
                },
            },
        },
    },
});

const transformExercises = (exercisesObj: any) => {
    const list: any[] = [];
    if (exercisesObj && typeof exercisesObj === "object") {
        for (const [name, data] of Object.entries(exercisesObj)) {
            const sets = (data as any)?.sets || [];
            list.push({
                name,
                sets: sets.map((s: any) => ({
                    weight: s.weight,
                    reps: s.reps,
                })),
            });
        }
    }
    return list;
};

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

    return `${UserId}/${startDate.getFullYear()}/${startDate.getMonth() + 1}/${startDate.getDate()}/${SessionId}.parquet`;
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

        const tmpFilePath = path.join("/tmp", `${crypto.randomUUID()}.parquet`);
        try {
            const writer = await ParquetWriter.openFile(schema, tmpFilePath);
            await writer.appendRow({
                UserId: workout.UserId,
                SessionId: workout.SessionId,
                StartTime: workout.StartTime,
                EndTime: workout.EndTime,
                TimeToExist: workout.TimeToExist,
                Exercises: transformExercises(workout.Exercises),
            });
            await writer.close();

            const fileBuffer = fs.readFileSync(tmpFilePath);
            await saveWorkoutSnapshot(fileKey, fileBuffer);
        } finally {
            if (fs.existsSync(tmpFilePath)) {
                fs.unlinkSync(tmpFilePath);
            }
        }
    }
};
