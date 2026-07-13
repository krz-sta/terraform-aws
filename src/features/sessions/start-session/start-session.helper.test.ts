import { jest } from "@jest/globals";

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    put: jest.fn(),
    query: jest.fn(),
}));

const { startSessionLogic } = await import("./start-session.helper.js");
const { put, query } =
    await import("../../shared/services/db-client.service.js");
const { ConflictError } = await import("../../shared/helpers/error.helper.js");

const mockedQuery = query as jest.MockedFunction<typeof query>;
const mockedPut = put as jest.MockedFunction<typeof put>;

describe("startSessionLogic", () => {
    const userId = "user-123";

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("creates a new session when the user has no active session", async () => {
        mockedQuery.mockResolvedValue([]);
        mockedPut.mockResolvedValue(undefined);

        const sessionId = await startSessionLogic(userId);

        expect(typeof sessionId).toBe("string");
        expect(sessionId).toHaveLength(36);
        expect(mockedPut).toHaveBeenCalledWith(
            expect.objectContaining({
                UserId: userId,
                SessionId: sessionId,
                StartTime: expect.any(String),
                TimeToExist: expect.any(Number),
            }),
            "active-sessions",
        );
    });

    it("throws ConflictError when the user already has an active session", async () => {
        mockedQuery.mockResolvedValue([
            {
                UserId: userId,
                SessionId: "existing-session-id",
                StartTime: new Date().toISOString(),
            },
        ]);

        await expect(startSessionLogic(userId)).rejects.toBeInstanceOf(
            ConflictError,
        );
        await expect(startSessionLogic(userId)).rejects.toMatchObject({
            message: "User already has an active session.",
            data: { sessionId: "existing-session-id" },
        });
        expect(mockedPut).not.toHaveBeenCalled();
    });
});
