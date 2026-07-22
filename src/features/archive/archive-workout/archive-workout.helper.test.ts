import crypto from "crypto";
import { HeadObjectCommand } from "@aws-sdk/client-s3";
import {
    archiveWorkoutSnapshots,
    collectWorkoutSnapshots,
} from "./archive-workout.helper.js";
import {
    ARCHIVE_BUCKET,
    cleanupUser,
    makeTestUserId,
    s3TestClient,
} from "../../../test-utils/aws.js";

const snapshot = {
    UserId: "user-123",
    SessionId: "session-456",
    StartTime: "2026-07-13T08:00:00.000Z",
    EndTime: "2026-07-13T09:00:00.000Z",
    TimeToExist: 1234567890,
    Exercises: {},
};

describe("archive workout helpers", () => {
    const userId = makeTestUserId();

    afterAll(async () => {
        await cleanupUser(userId);
    });

    it("extracts a workout snapshot from an SNS-wrapped DynamoDB event", () => {
        const event = {
            Records: [
                {
                    body: JSON.stringify({
                        Message: JSON.stringify({
                            Records: [
                                {
                                    dynamodb: {
                                        NewImage: {
                                            UserId: { S: snapshot.UserId },
                                            SessionId: {
                                                S: snapshot.SessionId,
                                            },
                                            StartTime: {
                                                S: snapshot.StartTime,
                                            },
                                            EndTime: { S: snapshot.EndTime },
                                            TimeToExist: {
                                                N: String(snapshot.TimeToExist),
                                            },
                                            Exercises: { M: {} },
                                        },
                                    },
                                },
                            ],
                        }),
                    }),
                },
            ],
        } as any;

        expect(collectWorkoutSnapshots(event)).toEqual([snapshot]);
    });

    it("archives the snapshot under the user-scoped key", async () => {
        const sessionId = crypto.randomUUID();
        const testSnapshot = {
            ...snapshot,
            UserId: userId,
            SessionId: sessionId,
        };

        await archiveWorkoutSnapshots([testSnapshot]);

        await expect(
            s3TestClient.send(
                new HeadObjectCommand({
                    Bucket: ARCHIVE_BUCKET,
                    Key: `${userId}/2026/7/13/${sessionId}.parquet`,
                }),
            ),
        ).resolves.toBeDefined();
    });
});
