import { jest } from "@jest/globals";

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    transactWrite: jest.fn(),
}));

const { saveSession } = await import("./save-session.service.js");
const { transactWrite } =
    await import("../../shared/services/db-client.service.js");

const mockedTransactWrite = transactWrite as jest.MockedFunction<
    typeof transactWrite
>;

describe("saveSession", () => {
    const sessionData = {
        UserId: "user-123",
        SessionId: "session-456",
        Exercises: {},
        StartTime: "2026-07-13T08:00:00.000Z",
        EndTime: "2026-07-13T09:00:00.000Z",
        TimeToExist: 1234567890,
    };

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("writes the session to history and deletes the active session", async () => {
        mockedTransactWrite.mockResolvedValue(undefined);

        await saveSession(sessionData);

        expect(mockedTransactWrite).toHaveBeenCalledWith([
            {
                type: "put",
                tableName: "session-history",
                item: sessionData,
            },
            {
                type: "delete",
                tableName: "active-sessions",
                key: {
                    pkName: "UserId",
                    pk: "user-123",
                    skName: "SessionId",
                    sk: "session-456",
                },
            },
        ]);
    });
});
