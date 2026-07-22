import crypto from "crypto";
import { updateSetLogic } from "./update-set.helper.js";
import { get, put } from "../../shared/services/db-client.service.js";
import { NotFoundError } from "../../shared/helpers/error.helper.js";
import {
    ACTIVE_SESSIONS_TABLE,
    cleanupUser,
    makeTestUserId,
    ttlSoon,
} from "../../../test-utils/aws.js";

describe("updateSetLogic", () => {
    const userId = makeTestUserId();
    const exerciseName = "bench_press";
    const setData = { weight: 110, reps: 4 };

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

    it("replaces the set at the given index", async () => {
        const sessionId = await seedSession({
            [exerciseName]: {
                Sets: [
                    { weight: 100, reps: 5 },
                    { weight: 90, reps: 6 },
                ],
            },
        });

        await updateSetLogic(userId, sessionId, exerciseName, 0, setData);

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
                Sets: [setData, { weight: 90, reps: 6 }],
            },
        });
    });

    it("throws NotFoundError when the session does not exist", async () => {
        await expect(
            updateSetLogic(
                userId,
                crypto.randomUUID(),
                exerciseName,
                0,
                setData,
            ),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws NotFoundError when the exercise does not exist", async () => {
        const sessionId = await seedSession({});

        await expect(
            updateSetLogic(userId, sessionId, exerciseName, 0, setData),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws NotFoundError when the set index does not exist", async () => {
        const sessionId = await seedSession({
            [exerciseName]: { Sets: [{ weight: 100, reps: 5 }] },
        });

        await expect(
            updateSetLogic(userId, sessionId, exerciseName, 5, setData),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
