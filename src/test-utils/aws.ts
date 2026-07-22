import crypto from "crypto";
import {
    S3Client,
    ListObjectsV2Command,
    DeleteObjectsCommand,
} from "@aws-sdk/client-s3";
import {
    delete as deleteItem,
    query,
} from "../features/shared/services/db-client.service.js";

export const ACTIVE_SESSIONS_TABLE = process.env.ACTIVE_SESSIONS_TABLE_NAME!;
export const SESSION_HISTORY_TABLE = process.env.SESSION_HISTORY_TABLE_NAME!;
export const USER_STATS_TABLE = process.env.USER_STATS_TABLE_NAME!;
export const ARCHIVE_BUCKET = process.env.WORKOUTS_ARCHIVE_BUCKET_NAME!;

export const s3TestClient = new S3Client({});

export function makeTestUserId() {
    return `it-user-${crypto.randomUUID()}`;
}

export function ttlSoon() {
    return Math.floor(Date.now() / 1000) + 3600;
}

export function sleep(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function deleteAllItemsForUser(
    userId: string,
    tableName: string,
    skName: string,
) {
    const items = await query({ pkName: "UserId", pk: userId }, tableName);

    for (const item of items) {
        await deleteItem(
            {
                pkName: "UserId",
                pk: userId,
                skName,
                sk: item[skName] as string,
            },
            tableName,
        );
    }
}

async function deleteArchiveObjectsForUser(userId: string) {
    const listed = await s3TestClient.send(
        new ListObjectsV2Command({
            Bucket: ARCHIVE_BUCKET,
            Prefix: `${userId}/`,
        }),
    );

    const keys = (listed.Contents ?? [])
        .map((object) => object.Key)
        .filter((key): key is string => Boolean(key));

    if (keys.length > 0) {
        await s3TestClient.send(
            new DeleteObjectsCommand({
                Bucket: ARCHIVE_BUCKET,
                Delete: { Objects: keys.map((Key) => ({ Key })) },
            }),
        );
    }
}

export async function cleanupUser(userId: string) {
    await deleteAllItemsForUser(userId, ACTIVE_SESSIONS_TABLE, "SessionId");
    await deleteAllItemsForUser(userId, SESSION_HISTORY_TABLE, "SessionId");
    await deleteAllItemsForUser(userId, USER_STATS_TABLE, "SK");
    await deleteArchiveObjectsForUser(userId);
}

export async function cleanupUsers(userIds: string[]) {
    for (const userId of userIds) {
        await cleanupUser(userId);
    }
}
