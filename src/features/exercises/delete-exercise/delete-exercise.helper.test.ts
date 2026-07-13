import { jest } from "@jest/globals";

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    get: jest.fn(),
    update: jest.fn(),
}));

const { deleteExerciseLogic } = await import("./delete-exercise.helper.js");
const { get, update } =
    await import("../../shared/services/db-client.service.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedUpdate = update as jest.MockedFunction<typeof update>;

describe("deleteExerciseLogic", () => {
    const userId = "user-123";
    const sessionId = "session-456";
    const exerciseName = "bench_press";

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("removes the exercise from the session", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {
                [exerciseName]: { Sets: [] },
                squat: { Sets: [{ weight: 100, reps: 5 }] },
            },
        });
        mockedUpdate.mockResolvedValue(undefined);

        await deleteExerciseLogic(userId, sessionId, exerciseName);

        expect(mockedUpdate).toHaveBeenCalledWith(
            expect.anything(),
            {
                Exercises: {
                    squat: { Sets: [{ weight: 100, reps: 5 }] },
                },
            },
            "active-sessions",
        );
    });

    it("throws NotFoundError when the session does not exist", async () => {
        mockedGet.mockResolvedValue(null);

        await expect(
            deleteExerciseLogic(userId, sessionId, exerciseName),
        ).rejects.toBeInstanceOf(NotFoundError);
        expect(mockedUpdate).not.toHaveBeenCalled();
    });

    it("throws NotFoundError when the exercise does not exist", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {},
        });

        await expect(
            deleteExerciseLogic(userId, sessionId, exerciseName),
        ).rejects.toBeInstanceOf(NotFoundError);
        expect(mockedUpdate).not.toHaveBeenCalled();
    });
});
