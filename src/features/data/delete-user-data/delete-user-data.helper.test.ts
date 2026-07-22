import crypto from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { deleteUserData } from "./delete-user-data.helper.js";
import { put, query } from "../../shared/services/db-client.service.js";
import {
    ACTIVE_SESSIONS_TABLE,
    ARCHIVE_BUCKET,
    SESSION_HISTORY_TABLE,
    USER_STATS_TABLE,
    cleanupUsers,
    makeTestUserId,
    s3TestClient,
    sleep,
    ttlSoon,
} from "../../../test-utils/aws.js";

describe("deleteUserData", () => {
    const testUsers: string[] = [];

    function newTestUser() {
        const userId = makeTestUserId();
        testUsers.push(userId);
        return userId;
    }

    afterAll(async () => {
        await sleep(5000);
        await cleanupUsers(testUsers);
    });

    async function seedHistorySession(userId: string) {
        await put(
            {
                UserId: userId,
                SessionId: crypto.randomUUID(),
                Exercises: {},
                StartTime: "2026-07-13T08:00:00.000Z",
                EndTime: "2026-07-13T09:00:00.000Z",
                TimeToExist: ttlSoon(),
            },
            SESSION_HISTORY_TABLE,
        );
    }

    it("deletes all related user records across tables", async () => {
        const userId = newTestUser();
        await seedHistorySession(userId);
        await seedHistorySession(userId);
        await put(
            { UserId: userId, SK: "STAT#TOTAL", TotalWorkouts: 1 },
            USER_STATS_TABLE,
        );
        await s3TestClient.send(
            new PutObjectCommand({
                Bucket: ARCHIVE_BUCKET,
                Key: `${userId}/2026/7/15/session-a.parquet`,
                Body: Buffer.from("parquet-data"),
            }),
        );

        await sleep(8000);

        const result = await deleteUserData(userId);

        expect(result.userId).toBe(userId);
        expect(result.deleted.sessionHistory).toBe(2);
        expect(result.deleted.userStats).toBeGreaterThanOrEqual(1);
        expect(result.deleted.archiveObjects).toBeGreaterThanOrEqual(1);

        await expect(
            query({ pkName: "UserId", pk: userId }, SESSION_HISTORY_TABLE),
        ).resolves.toEqual([]);
    });

    it("does not delete data while an active session exists", async () => {
        const userId = newTestUser();
        await put(
            {
                UserId: userId,
                SessionId: crypto.randomUUID(),
                TimeToExist: ttlSoon(),
            },
            ACTIVE_SESSIONS_TABLE,
        );

        await expect(deleteUserData(userId)).rejects.toThrow(
            "Data cannot be deleted while an active session exists.",
        );
    });
});
