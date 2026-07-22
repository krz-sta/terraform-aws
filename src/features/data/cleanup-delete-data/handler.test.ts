import crypto from "crypto";
import { handler } from "./handler.js";
import { put } from "../../shared/services/db-client.service.js";
import {
    ACTIVE_SESSIONS_TABLE,
    cleanupUser,
    makeTestUserId,
    ttlSoon,
} from "../../../test-utils/aws.js";

const invoke = (event: any): any => handler(event, {} as any, undefined as any);

describe("cleanup-delete-data handler", () => {
    const conflictUserId = makeTestUserId();

    afterAll(async () => {
        await cleanupUser(conflictUserId);
    });

    it("continues a partial deletion", async () => {
        const userId = makeTestUserId();

        await expect(invoke({ userId })).resolves.toEqual({
            userId,
            deleted: {
                sessionHistory: 0,
                userStats: 0,
                archiveObjects: 0,
            },
        });
    });

    it("rejects missing userId", async () => {
        await expect(invoke({})).rejects.toThrow(
            "Missing required field: userId",
        );
    });

    it("propagates a cleanup failure", async () => {
        await put(
            {
                UserId: conflictUserId,
                SessionId: crypto.randomUUID(),
                TimeToExist: ttlSoon(),
            },
            ACTIVE_SESSIONS_TABLE,
        );

        await expect(invoke({ userId: conflictUserId })).rejects.toThrow(
            "Data cannot be deleted while an active session exists.",
        );
    });
});
