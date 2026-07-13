import { jest } from "@jest/globals";

jest.unstable_mockModule("./save-session.service.js", () => ({
    saveSession: jest.fn(),
}));

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    get: jest.fn(),
}));

const { saveSessionLogic } = await import("./save-session.helper.js");
const { saveSession } = await import("./save-session.service.js");
const { get } = await import("../../shared/services/db-client.service.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedSaveSession = saveSession as jest.MockedFunction<
    typeof saveSession
>;

describe("saveSessionLogic", () => {
    const userId = "user-123";
    const sessionId = "session-456";

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("saves an active session to history and deletes the active record", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
            Exercises: {
                bench_press: { Sets: [{ weight: 100, reps: 5 }] },
            },
            StartTime: "2026-07-13T08:00:00.000Z",
        });
        mockedSaveSession.mockResolvedValue(undefined);

        await saveSessionLogic(userId, sessionId);

        expect(mockedSaveSession).toHaveBeenCalledWith(
            expect.objectContaining({
                UserId: userId,
                SessionId: sessionId,
                StartTime: "2026-07-13T08:00:00.000Z",
                EndTime: expect.any(String),
                TimeToExist: expect.any(Number),
                Exercises: {
                    bench_press: { Sets: [{ weight: 100, reps: 5 }] },
                },
            }),
        );
    });

    it("uses an empty exercises map when the session has no exercises", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SessionId: sessionId,
        });
        mockedSaveSession.mockResolvedValue(undefined);

        await saveSessionLogic(userId, sessionId);

        expect(mockedSaveSession).toHaveBeenCalledWith(
            expect.objectContaining({
                Exercises: {},
            }),
        );
    });

    it("throws NotFoundError when the active session does not exist", async () => {
        mockedGet.mockResolvedValue(null);

        await expect(
            saveSessionLogic(userId, sessionId),
        ).rejects.toBeInstanceOf(NotFoundError);
        expect(mockedSaveSession).not.toHaveBeenCalled();
    });
});
