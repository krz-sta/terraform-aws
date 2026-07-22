import crypto from "crypto";
import { saveSession } from "./save-session.service.js";
import { get, put } from "../../shared/services/db-client.service.js";
import {
    ACTIVE_SESSIONS_TABLE,
    SESSION_HISTORY_TABLE,
    cleanupUser,
    makeTestUserId,
    sleep,
    ttlSoon,
} from "../../../test-utils/aws.js";

describe("saveSession", () => {
    const userId = makeTestUserId();
    const sessionId = crypto.randomUUID();

    afterAll(async () => {
        await sleep(5000);
        await cleanupUser(userId);
    });

    it("writes the session to history and deletes the active session", async () => {
        await put(
            {
                UserId: userId,
                SessionId: sessionId,
                StartTime: "2026-07-13T08:00:00.000Z",
                TimeToExist: ttlSoon(),
            },
            ACTIVE_SESSIONS_TABLE,
        );

        const sessionData = {
            UserId: userId,
            SessionId: sessionId,
            Exercises: {},
            StartTime: "2026-07-13T08:00:00.000Z",
            EndTime: "2026-07-13T09:00:00.000Z",
            TimeToExist: ttlSoon(),
        };

        await saveSession(sessionData);

        const key = {
            pkName: "UserId",
            pk: userId,
            skName: "SessionId",
            sk: sessionId,
        };
        await expect(get(key, SESSION_HISTORY_TABLE)).resolves.toEqual(
            sessionData,
        );
        await expect(get(key, ACTIVE_SESSIONS_TABLE)).resolves.toBeNull();
    });
});
