import { jest } from "@jest/globals";

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    get: jest.fn(),
    update: jest.fn(),
}));

const { deleteSetLogic } = await import("./delete-set.helper.js");
const { get, update } =
    await import("../../shared/services/db-client.service.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedUpdate = update as jest.MockedFunction<typeof update>;

describe("deleteSetLogic", () => {
    const userId = "user-123";
    const sessionId = "session-456";
    const exerciseName = "bench_press";

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("removes the set at the given index", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {
                [exerciseName]: {
                    Sets: [
                        { weight: 100, reps: 5 },
                        { weight: 90, reps: 6 },
                    ],
                },
            },
        });
        mockedUpdate.mockResolvedValue(undefined);

        await deleteSetLogic(userId, sessionId, exerciseName, 0);

        expect(mockedUpdate).toHaveBeenCalledWith(
            expect.anything(),
            {
                Exercises: {
                    [exerciseName]: {
                        Sets: [{ weight: 90, reps: 6 }],
                    },
                },
            },
            "active-sessions",
        );
    });

    it("throws NotFoundError when the session does not exist", async () => {
        mockedGet.mockResolvedValue(null);

        await expect(
            deleteSetLogic(userId, sessionId, exerciseName, 0),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws NotFoundError when the exercise does not exist", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {},
        });

        await expect(
            deleteSetLogic(userId, sessionId, exerciseName, 0),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws NotFoundError for an out-of-range set index", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {
                [exerciseName]: { Sets: [{ weight: 100, reps: 5 }] },
            },
        });

        await expect(
            deleteSetLogic(userId, sessionId, exerciseName, 3),
        ).rejects.toBeInstanceOf(NotFoundError);
        expect(mockedUpdate).not.toHaveBeenCalled();
    });
});
