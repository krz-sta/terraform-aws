import crypto from "crypto";
import { startSessionLogic } from "./start-session.helper.js";
import { get, put } from "../../shared/services/db-client.service.js";
import { ConflictError } from "../../shared/helpers/error.helper.js";
import {
    ACTIVE_SESSIONS_TABLE,
    cleanupUser,
    makeTestUserId,
    ttlSoon,
} from "../../../test-utils/aws.js";

describe("startSessionLogic", () => {
    const userId = makeTestUserId();

    afterEach(async () => {
        await cleanupUser(userId);
    });

    it("creates a new session when the user has no active session", async () => {
        const sessionId = await startSessionLogic(userId);

        expect(typeof sessionId).toBe("string");
        expect(sessionId).toHaveLength(36);

        const stored = await get(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SessionId",
                sk: sessionId,
            },
            ACTIVE_SESSIONS_TABLE,
        );
        expect(stored).toEqual(
            expect.objectContaining({
                UserId: userId,
                SessionId: sessionId,
                StartTime: expect.any(String),
                TimeToExist: expect.any(Number),
            }),
        );
    });

    it("throws ConflictError when the user already has an active session", async () => {
        const existingSessionId = crypto.randomUUID();
        await put(
            {
                UserId: userId,
                SessionId: existingSessionId,
                StartTime: new Date().toISOString(),
                TimeToExist: ttlSoon(),
            },
            ACTIVE_SESSIONS_TABLE,
        );

        await expect(startSessionLogic(userId)).rejects.toBeInstanceOf(
            ConflictError,
        );
        await expect(startSessionLogic(userId)).rejects.toMatchObject({
            message: "User already has an active session.",
            data: { sessionId: existingSessionId },
        });
    });
});
