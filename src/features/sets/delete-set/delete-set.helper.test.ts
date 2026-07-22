import crypto from "crypto";
import { deleteSetLogic } from "./delete-set.helper.js";
import { get, put } from "../../shared/services/db-client.service.js";
import { NotFoundError } from "../../shared/helpers/error.helper.js";
import {
    ACTIVE_SESSIONS_TABLE,
    cleanupUser,
    makeTestUserId,
    ttlSoon,
} from "../../../test-utils/aws.js";

describe("deleteSetLogic", () => {
    const userId = makeTestUserId();
    const exerciseName = "bench_press";

    afterAll(async () => {
        await cleanupUser(userId);
    });

    async function seedSession(exercises: Record<string, unknown>) {
        const sessionId = crypto.randomUUID();
        await put(
            {
                UserId: userId,
                SessionId: sessionId,
                Exercises: exercises,
                TimeToExist: ttlSoon(),
            },
            ACTIVE_SESSIONS_TABLE,
        );
        return sessionId;
    }

    it("removes the set at the given index", async () => {
        const sessionId = await seedSession({
            [exerciseName]: {
                Sets: [
                    { weight: 100, reps: 5 },
                    { weight: 90, reps: 6 },
                ],
            },
        });

        await deleteSetLogic(userId, sessionId, exerciseName, 0);

        const stored = await get(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SessionId",
                sk: sessionId,
            },
            ACTIVE_SESSIONS_TABLE,
        );
        expect(stored?.Exercises).toEqual({
            [exerciseName]: {
                Sets: [{ weight: 90, reps: 6 }],
            },
        });
    });

    it("throws NotFoundError when the session does not exist", async () => {
        await expect(
            deleteSetLogic(userId, crypto.randomUUID(), exerciseName, 0),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws NotFoundError when the exercise does not exist", async () => {
        const sessionId = await seedSession({});

        await expect(
            deleteSetLogic(userId, sessionId, exerciseName, 0),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws NotFoundError for an out-of-range set index", async () => {
        const sessionId = await seedSession({
            [exerciseName]: { Sets: [{ weight: 100, reps: 5 }] },
        });

        await expect(
            deleteSetLogic(userId, sessionId, exerciseName, 3),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
