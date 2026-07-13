import { jest } from "@jest/globals";

jest.unstable_mockModule("./update-stats.helper.js", () => ({
    buildSessionsForStats: jest.fn(),
    calculateSessionStats: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { buildSessionsForStats, calculateSessionStats } =
    await import("./update-stats.helper.js");

const mockedBuild = buildSessionsForStats as jest.MockedFunction<
    typeof buildSessionsForStats
>;
const mockedCalculate = calculateSessionStats as jest.MockedFunction<
    typeof calculateSessionStats
>;

describe("update-stats handler", () => {
    const sqsEvent = { Records: [{ body: "{}" }] } as any;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("calculates stats for collected sessions", async () => {
        const sessions = [{ userId: "user-123", exercises: {} }];
        mockedBuild.mockReturnValue(sessions as any);
        mockedCalculate.mockResolvedValue(undefined);

        await handler(sqsEvent);

        expect(mockedBuild).toHaveBeenCalledWith(sqsEvent);
        expect(mockedCalculate).toHaveBeenCalledWith(sessions);
    });

    it("does nothing when no sessions are collected", async () => {
        mockedBuild.mockReturnValue([]);
        mockedCalculate.mockResolvedValue(undefined);

        await handler(sqsEvent);

        expect(mockedCalculate).toHaveBeenCalledWith([]);
    });

    it("throws when stats calculation fails", async () => {
        mockedBuild.mockReturnValue([{} as any]);
        mockedCalculate.mockRejectedValue(new Error("DB error"));

        await expect(handler(sqsEvent)).rejects.toThrow("DB error");
    });
});
