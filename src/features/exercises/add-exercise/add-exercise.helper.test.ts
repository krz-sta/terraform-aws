import crypto from "crypto";
import { addExerciseLogic } from "./add-exercise.helper.js";
import { get, put } from "../../shared/services/db-client.service.js";
import {
    ConflictError,
    NotFoundError,
} from "../../shared/helpers/error.helper.js";
import {
    ACTIVE_SESSIONS_TABLE,
    cleanupUser,
    makeTestUserId,
    ttlSoon,
} from "../../../test-utils/aws.js";

describe("addExerciseLogic", () => {
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

    it("keeps existing exercises when adding a new one", async () => {
        const sessionId = await seedSession({
            squat: { Sets: [{ weight: 100, reps: 5 }] },
        });

        await addExerciseLogic(userId, sessionId, exerciseName);

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
            [exerciseName]: { Sets: [] },
        });
    });

    it("throws NotFoundError when the session does not exist", async () => {
        await expect(
            addExerciseLogic(userId, crypto.randomUUID(), exerciseName),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws ConflictError when the exercise already exists", async () => {
        const sessionId = await seedSession({
            [exerciseName]: { Sets: [] },
        });

        await expect(
            addExerciseLogic(userId, sessionId, exerciseName),
        ).rejects.toBeInstanceOf(ConflictError);
    });
});
