import crypto from "crypto";
import { saveSessionLogic } from "./save-session.helper.js";
import { get, put } from "../../shared/services/db-client.service.js";
import { NotFoundError } from "../../shared/helpers/error.helper.js";
import {
    ACTIVE_SESSIONS_TABLE,
    SESSION_HISTORY_TABLE,
    cleanupUser,
    makeTestUserId,
    sleep,
    ttlSoon,
} from "../../../test-utils/aws.js";

describe("saveSessionLogic", () => {
    const userId = makeTestUserId();

    afterAll(async () => {
        await sleep(5000);
        await cleanupUser(userId);
    });

    it("saves an active session to history and deletes the active record", async () => {
        const sessionId = crypto.randomUUID();
        await put(
            {
                UserId: userId,
                SessionId: sessionId,
                Exercises: {
                    bench_press: { Sets: [{ weight: 100, reps: 5 }] },
                },
                StartTime: "2026-07-13T08:00:00.000Z",
                TimeToExist: ttlSoon(),
            },
            ACTIVE_SESSIONS_TABLE,
        );

        await saveSessionLogic(userId, sessionId);

        const historyKey = {
            pkName: "UserId",
            pk: userId,
            skName: "SessionId",
            sk: sessionId,
        };
        const historyItem = await get(historyKey, SESSION_HISTORY_TABLE);
        expect(historyItem).toEqual(
            expect.objectContaining({
                UserId: userId,
                SessionId: sessionId,
                StartTime: "2026-07-13T08:00:00.000Z",
                EndTime: expect.any(String),
                TimeToExist: expect.any(Number),
                Exercises: {
                    bench_press: { Sets: [{ weight: 100, reps: 5 }] },
                },
            }),
        );

        const activeItem = await get(historyKey, ACTIVE_SESSIONS_TABLE);
        expect(activeItem).toBeNull();
    });

    it("uses an empty exercises map when the session has no exercises", async () => {
        const sessionId = crypto.randomUUID();
        await put(
            {
                UserId: userId,
                SessionId: sessionId,
                StartTime: "2026-07-13T08:00:00.000Z",
                TimeToExist: ttlSoon(),
            },
            ACTIVE_SESSIONS_TABLE,
        );

        await saveSessionLogic(userId, sessionId);

        const historyItem = await get(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SessionId",
                sk: sessionId,
            },
            SESSION_HISTORY_TABLE,
        );
        expect(historyItem).toEqual(
            expect.objectContaining({
                Exercises: {},
            }),
        );
    });

    it("throws NotFoundError when the active session does not exist", async () => {
        await expect(
            saveSessionLogic(userId, crypto.randomUUID()),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
