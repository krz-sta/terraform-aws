import { jest } from "@jest/globals";

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    get: jest.fn(),
    update: jest.fn(),
}));

const { addExerciseLogic } = await import("./add-exercise.helper.js");
const { get, update } =
    await import("../../shared/services/db-client.service.js");
const { ConflictError, NotFoundError } =
    await import("../../shared/helpers/error.helper.js");

const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedUpdate = update as jest.MockedFunction<typeof update>;

describe("addExerciseLogic", () => {
    const userId = "user-123";
    const sessionId = "session-456";
    const exerciseName = "bench_press";

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("adds a new exercise to the session", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {},
        });
        mockedUpdate.mockResolvedValue(undefined);

        await addExerciseLogic(userId, sessionId, exerciseName);

        expect(mockedUpdate).toHaveBeenCalledWith(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SessionId",
                sk: sessionId,
            },
            {
                Exercises: { [exerciseName]: { Sets: [] } },
            },
            "active-sessions",
        );
    });

    it("keeps existing exercises when adding a new one", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {
                squat: { Sets: [{ weight: 100, reps: 5 }] },
            },
        });
        mockedUpdate.mockResolvedValue(undefined);

        await addExerciseLogic(userId, sessionId, exerciseName);

        expect(mockedUpdate).toHaveBeenCalledWith(
            expect.anything(),
            {
                Exercises: {
                    squat: { Sets: [{ weight: 100, reps: 5 }] },
                    [exerciseName]: { Sets: [] },
                },
            },
            "active-sessions",
        );
    });

    it("throws NotFoundError when the session does not exist", async () => {
        mockedGet.mockResolvedValue(null);

        await expect(
            addExerciseLogic(userId, sessionId, exerciseName),
        ).rejects.toBeInstanceOf(NotFoundError);
        expect(mockedUpdate).not.toHaveBeenCalled();
    });

    it("throws ConflictError when the exercise already exists", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {
                [exerciseName]: { Sets: [] },
            },
        });

        await expect(
            addExerciseLogic(userId, sessionId, exerciseName),
        ).rejects.toBeInstanceOf(ConflictError);
        expect(mockedUpdate).not.toHaveBeenCalled();
    });
});
