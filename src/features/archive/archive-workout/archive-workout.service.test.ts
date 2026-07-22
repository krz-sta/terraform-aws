import crypto from "crypto";
import { GetObjectCommand } from "@aws-sdk/client-s3";
import { saveWorkoutSnapshot } from "./archive-workout.service.js";
import {
    ARCHIVE_BUCKET,
    cleanupUser,
    makeTestUserId,
    s3TestClient,
} from "../../../test-utils/aws.js";

describe("saveWorkoutSnapshot", () => {
    const userId = makeTestUserId();

    afterAll(async () => {
        await cleanupUser(userId);
    });

    it("builds a parquet file and uploads it to S3", async () => {
        const sessionId = crypto.randomUUID();
        const fileKey = `${userId}/2026/7/13/${sessionId}.parquet`;
        const workout = {
            UserId: userId,
            SessionId: sessionId,
            StartTime: "2026-07-13T08:00:00.000Z",
            EndTime: "2026-07-13T09:00:00.000Z",
            TimeToExist: 1234567890,
            Exercises: { bench_press: { Sets: [{ weight: 100, reps: 5 }] } },
        };

        await saveWorkoutSnapshot(fileKey, workout);

        const object = await s3TestClient.send(
            new GetObjectCommand({
                Bucket: ARCHIVE_BUCKET,
                Key: fileKey,
            }),
        );
        expect(object.ContentType).toBe("application/octet-stream");

        const body = Buffer.from(await object.Body!.transformToByteArray());
        expect(body.subarray(0, 4).toString()).toBe("PAR1");
    });
});
