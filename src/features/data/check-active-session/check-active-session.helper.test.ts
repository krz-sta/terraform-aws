import crypto from "crypto";
import { checkActiveSession } from "./check-active-session.helper.js";
import { put } from "../../shared/services/db-client.service.js";
import {
    ACTIVE_SESSIONS_TABLE,
    cleanupUser,
    makeTestUserId,
    ttlSoon,
} from "../../../test-utils/aws.js";

describe("checkActiveSession", () => {
    const userId = makeTestUserId();

    afterAll(async () => {
        await cleanupUser(userId);
    });

    it("returns true when an active session exists", async () => {
        await put(
            {
                UserId: userId,
                SessionId: crypto.randomUUID(),
                TimeToExist: ttlSoon(),
            },
            ACTIVE_SESSIONS_TABLE,
        );

        await expect(checkActiveSession(userId)).resolves.toEqual({
            userId,
            hasActiveSession: true,
        });
    });

    it("returns false when no active session exists", async () => {
        const freshUserId = makeTestUserId();

        await expect(checkActiveSession(freshUserId)).resolves.toEqual({
            userId: freshUserId,
            hasActiveSession: false,
        });
    });
});
