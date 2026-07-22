import crypto from "crypto";
import { deleteExerciseLogic } from "./delete-exercise.helper.js";
import { get, put } from "../../shared/services/db-client.service.js";
import { NotFoundError } from "../../shared/helpers/error.helper.js";
import {
    ACTIVE_SESSIONS_TABLE,
    cleanupUser,
    makeTestUserId,
    ttlSoon,
} from "../../../test-utils/aws.js";

describe("deleteExerciseLogic", () => {
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

    it("removes the exercise from the session", async () => {
        const sessionId = await seedSession({
            [exerciseName]: { Sets: [] },
            squat: { Sets: [{ weight: 100, reps: 5 }] },
        });

        await deleteExerciseLogic(userId, sessionId, exerciseName);

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
            squat: { Sets: [{ weight: 100, reps: 5 }] },
        });
    });

    it("throws NotFoundError when the session does not exist", async () => {
        await expect(
            deleteExerciseLogic(userId, crypto.randomUUID(), exerciseName),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws NotFoundError when the exercise does not exist", async () => {
        const sessionId = await seedSession({});

        await expect(
            deleteExerciseLogic(userId, sessionId, exerciseName),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
