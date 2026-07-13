import { jest } from "@jest/globals";

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    get: jest.fn(),
    update: jest.fn(),
}));

const { updateSetLogic } = await import("./update-set.helper.js");
const { get, update } =
    await import("../../shared/services/db-client.service.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedUpdate = update as jest.MockedFunction<typeof update>;

describe("updateSetLogic", () => {
    const userId = "user-123";
    const sessionId = "session-456";
    const exerciseName = "bench_press";
    const setData = { weight: 110, reps: 4 };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("replaces the set at the given index", async () => {
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

        await updateSetLogic(userId, sessionId, exerciseName, 0, setData);

        expect(mockedUpdate).toHaveBeenCalledWith(
            expect.anything(),
            {
                Exercises: {
                    [exerciseName]: {
                        Sets: [setData, { weight: 90, reps: 6 }],
                    },
                },
            },
            "active-sessions",
        );
    });

    it("throws NotFoundError when the session does not exist", async () => {
        mockedGet.mockResolvedValue(null);

        await expect(
            updateSetLogic(userId, sessionId, exerciseName, 0, setData),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws NotFoundError when the exercise does not exist", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {},
        });

        await expect(
            updateSetLogic(userId, sessionId, exerciseName, 0, setData),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("throws NotFoundError when the set index does not exist", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {
                [exerciseName]: { Sets: [{ weight: 100, reps: 5 }] },
            },
        });

        await expect(
            updateSetLogic(userId, sessionId, exerciseName, 5, setData),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
