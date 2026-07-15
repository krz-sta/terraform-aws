import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { ParquetSchema, ParquetWriter } from "@dsnp/parquetjs";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { requireEnv } from "../../shared/helpers/env.helper.js";

const s3 = new S3Client({});
const bucketName = requireEnv("WORKOUTS_ARCHIVE_BUCKET_NAME");

const schema = new ParquetSchema({
    UserId: { type: "UTF8" },
    SessionId: { type: "UTF8" },
    StartTime: { type: "UTF8" },
    EndTime: { type: "UTF8" },
    TimeToExist: { type: "INT64" },
    ExercisesJson: { type: "UTF8" },
});

export type WorkoutSnapshot = {
    UserId: string;
    SessionId: string;
    StartTime: string;
    EndTime: string;
    TimeToExist: number;
    Exercises: unknown;
};

async function buildParquetBuffer(workout: WorkoutSnapshot) {
    const tmpFilePath = path.join("/tmp", `${crypto.randomUUID()}.parquet`);

    try {
        const writer = await ParquetWriter.openFile(schema, tmpFilePath);
        await writer.appendRow({
            UserId: workout.UserId,
            SessionId: workout.SessionId,
            StartTime: workout.StartTime,
            EndTime: workout.EndTime,
            TimeToExist: workout.TimeToExist,
            ExercisesJson: JSON.stringify(workout.Exercises),
        });
        await writer.close();

        return fs.readFileSync(tmpFilePath);
    } finally {
        if (fs.existsSync(tmpFilePath)) {
            fs.unlinkSync(tmpFilePath);
        }
    }
}

export async function saveWorkoutSnapshot(
    fileKey: string,
    workout: WorkoutSnapshot,
) {
    const body = await buildParquetBuffer(workout);

    await s3.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
            Body: body,
            ContentType: "application/octet-stream",
        }),
    );
}
