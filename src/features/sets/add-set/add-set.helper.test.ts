import crypto from "crypto";
import { addSetLogic } from "./add-set.helper.js";
import { get, put } from "../../shared/services/db-client.service.js";
import { NotFoundError } from "../../shared/helpers/error.helper.js";
import {
    ACTIVE_SESSIONS_TABLE,
    cleanupUser,
    makeTestUserId,
    ttlSoon,
} from "../../../test-utils/aws.js";

describe("addSetLogic", () => {
    const userId = makeTestUserId();
    const exerciseName = "bench_press";
    const setData = { weight: 100, reps: 5 };

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

    async function readExercises(sessionId: string) {
        const stored = await get(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SessionId",
                sk: sessionId,
            },
            ACTIVE_SESSIONS_TABLE,
        );
        return stored?.Exercises;
    }

    it("appends a set to an existing exercise", async () => {
        const sessionId = await seedSession({
            [exerciseName]: { Sets: [{ weight: 80, reps: 8 }] },
        });

        await addSetLogic(userId, sessionId, exerciseName, setData);

        await expect(readExercises(sessionId)).resolves.toEqual({
            [exerciseName]: {
                Sets: [{ weight: 80, reps: 8 }, setData],
            },
        });
    });

    it("creates the exercise if it does not exist", async () => {
        const sessionId = await seedSession({});

        await addSetLogic(userId, sessionId, exerciseName, setData);

        await expect(readExercises(sessionId)).resolves.toEqual({
            [exerciseName]: { Sets: [setData] },
        });
    });

    it("throws NotFoundError when the session does not exist", async () => {
        await expect(
            addSetLogic(userId, crypto.randomUUID(), exerciseName, setData),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
