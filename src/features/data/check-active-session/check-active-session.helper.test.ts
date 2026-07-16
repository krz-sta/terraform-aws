import { jest } from "@jest/globals";

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    query: jest.fn(),
}));

const { checkActiveSession } = await import("./check-active-session.helper.js");
const { query } = await import("../../shared/services/db-client.service.js");
const mockedQuery = query as jest.MockedFunction<typeof query>;

describe("checkActiveSession", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns true when an active session exists", async () => {
        mockedQuery.mockResolvedValue([
            { UserId: "user-123", SessionId: "session-1" },
        ] as any);

        await expect(checkActiveSession("user-123")).resolves.toEqual({
            userId: "user-123",
            hasActiveSession: true,
        });
        expect(mockedQuery).toHaveBeenCalledWith(
            { pkName: "UserId", pk: "user-123" },
            "active-sessions",
            { limit: 1 },
        );
    });

    it("returns false when no active session exists", async () => {
        mockedQuery.mockResolvedValue([] as any);

        await expect(checkActiveSession("user-123")).resolves.toEqual({
            userId: "user-123",
            hasActiveSession: false,
        });
    });
});
