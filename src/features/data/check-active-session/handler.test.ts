import { jest } from "@jest/globals";

jest.unstable_mockModule("./check-active-session.helper.js", () => ({
    checkActiveSession: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { checkActiveSession } = await import("./check-active-session.helper.js");
const mockedCheckActiveSession = checkActiveSession as jest.MockedFunction<
    typeof checkActiveSession
>;

const invoke = async (event: unknown) =>
    (await handler(event as any, {} as any, undefined as any))!;

describe("check-active-session handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns the session check result", async () => {
        mockedCheckActiveSession.mockResolvedValue({
            userId: "user-123",
            hasActiveSession: true,
        });

        await expect(invoke({ userId: "user-123" })).resolves.toEqual({
            userId: "user-123",
            hasActiveSession: true,
        });

        expect(mockedCheckActiveSession).toHaveBeenCalledWith("user-123");
    });

    it("rejects missing userId", async () => {
        await expect(invoke({})).rejects.toThrow(
            "Missing required field: userId",
        );
    });
});
