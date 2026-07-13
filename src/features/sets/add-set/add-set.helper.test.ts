import { jest } from "@jest/globals";

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    get: jest.fn(),
    update: jest.fn(),
}));

const { addSetLogic } = await import("./add-set.helper.js");
const { get, update } =
    await import("../../shared/services/db-client.service.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedUpdate = update as jest.MockedFunction<typeof update>;

describe("addSetLogic", () => {
    const userId = "user-123";
    const sessionId = "session-456";
    const exerciseName = "bench_press";
    const setData = { weight: 100, reps: 5 };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("appends a set to an existing exercise", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {
                [exerciseName]: { Sets: [{ weight: 80, reps: 8 }] },
            },
        });
        mockedUpdate.mockResolvedValue(undefined);

        await addSetLogic(userId, sessionId, exerciseName, setData);

        expect(mockedUpdate).toHaveBeenCalledWith(
            expect.anything(),
            {
                Exercises: {
                    [exerciseName]: {
                        Sets: [{ weight: 80, reps: 8 }, setData],
                    },
                },
            },
            "active-sessions",
        );
    });

    it("creates the exercise if it does not exist", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {},
        });
        mockedUpdate.mockResolvedValue(undefined);

        await addSetLogic(userId, sessionId, exerciseName, setData);

        expect(mockedUpdate).toHaveBeenCalledWith(
            expect.anything(),
            {
                Exercises: {
                    [exerciseName]: { Sets: [setData] },
                },
            },
            "active-sessions",
        );
    });

    it("throws NotFoundError when the session does not exist", async () => {
        mockedGet.mockResolvedValue(null);

        await expect(
            addSetLogic(userId, sessionId, exerciseName, setData),
        ).rejects.toBeInstanceOf(NotFoundError);
        expect(mockedUpdate).not.toHaveBeenCalled();
    });
});
