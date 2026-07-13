import { jest } from "@jest/globals";

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    get: jest.fn(),
}));

const { getSessionLogic } = await import("./get-session.helper.js");
const { get } = await import("../../shared/services/db-client.service.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedGet = get as jest.MockedFunction<typeof get>;

describe("getSessionLogic", () => {
    const userId = "user-123";
    const sessionId = "session-456";

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns the session when it exists", async () => {
        const session = {
            UserId: userId,
            SessionId: sessionId,
            StartTime: "2026-07-13T08:00:00.000Z",
        };
        mockedGet.mockResolvedValue(session);

        const result = await getSessionLogic(userId, sessionId);

        expect(result).toEqual(session);
        expect(mockedGet).toHaveBeenCalledWith(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SessionId",
                sk: sessionId,
            },
            "active-sessions",
        );
    });

    it("throws NotFoundError when the session does not exist", async () => {
        mockedGet.mockResolvedValue(null);

        await expect(getSessionLogic(userId, sessionId)).rejects.toBeInstanceOf(
            NotFoundError,
        );
    });
});
