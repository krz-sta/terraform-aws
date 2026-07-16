import { requireEnv } from "../../shared/helpers/env.helper.js";
import {
    DeleteObjectsCommand,
    ListObjectsV2Command,
    S3Client,
} from "@aws-sdk/client-s3";
import {
    delete as deleteItem,
    query,
} from "../../shared/services/db-client.service.js";
import {
    ActiveSessionItem,
    SessionHistoryItem,
    UserStatItem,
} from "../../shared/types/workout.js";
import { ConflictError } from "../../shared/helpers/error.helper.js";
import type { DeleteUserDataResult } from "../../shared/types/data.js";

const ACTIVE_SESSIONS_TABLE_NAME = requireEnv("ACTIVE_SESSIONS_TABLE_NAME");
const SESSION_HISTORY_TABLE_NAME = requireEnv("SESSION_HISTORY_TABLE_NAME");
const USER_STATS_TABLE_NAME = requireEnv("USER_STATS_TABLE_NAME");
const WORKOUTS_ARCHIVE_BUCKET_NAME = requireEnv("WORKOUTS_ARCHIVE_BUCKET_NAME");
const s3 = new S3Client({});

async function deleteArchiveObjects(userId: string) {
    const listResponse = await s3.send(
        new ListObjectsV2Command({
            Bucket: WORKOUTS_ARCHIVE_BUCKET_NAME,
            Prefix: `${userId}/`,
        }),
    );

    if (listResponse.IsTruncated) {
        throw new Error("S3 archive exceeded the 1,000-object limit.");
    }

    const keys = (listResponse.Contents || [])
        .map((object) => object.Key)
        .filter((key): key is string => Boolean(key));

    if (keys.length === 0) {
        return 0;
    }

    const deleteResponse = await s3.send(
        new DeleteObjectsCommand({
            Bucket: WORKOUTS_ARCHIVE_BUCKET_NAME,
            Delete: {
                Objects: keys.map((Key) => ({ Key })),
            },
        }),
    );

    if (deleteResponse.Errors?.length) {
        throw new Error(
            `Failed to delete ${deleteResponse.Errors.length} archive object(s).`,
        );
    }

    return keys.length;
}

export async function deleteUserData(
    userId: string,
): Promise<DeleteUserDataResult> {
    const activeSessions = await query<ActiveSessionItem>(
        {
            pkName: "UserId",
            pk: userId,
        },
        ACTIVE_SESSIONS_TABLE_NAME,
        { limit: 1 },
    );

    if (activeSessions.length > 0) {
        throw new ConflictError(
            "Data cannot be deleted while an active session exists.",
        );
    }

    const sessionHistory = await query<SessionHistoryItem>(
        {
            pkName: "UserId",
            pk: userId,
        },
        SESSION_HISTORY_TABLE_NAME,
    );

    for (const session of sessionHistory) {
        await deleteItem(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SessionId",
                sk: session.SessionId,
            },
            SESSION_HISTORY_TABLE_NAME,
        );
    }

    const userStats = await query<UserStatItem>(
        {
            pkName: "UserId",
            pk: userId,
        },
        USER_STATS_TABLE_NAME,
    );

    for (const stat of userStats) {
        await deleteItem(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SK",
                sk: stat.SK,
            },
            USER_STATS_TABLE_NAME,
        );
    }

    const archiveObjects = await deleteArchiveObjects(userId);

    return {
        userId,
        deleted: {
            sessionHistory: sessionHistory.length,
            userStats: userStats.length,
            archiveObjects,
        },
    };
}
