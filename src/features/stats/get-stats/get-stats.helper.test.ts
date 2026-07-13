import { jest } from "@jest/globals";

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    query: jest.fn(),
}));

const { getStatsLogic } = await import("./get-stats.helper.js");
const { query } = await import("../../shared/services/db-client.service.js");

const mockedQuery = query as jest.MockedFunction<typeof query>;

describe("getStatsLogic", () => {
    const userId = "user-123";

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns total and exercise stats partitioned by SK", async () => {
        mockedQuery.mockResolvedValue([
            {
                UserId: userId,
                SK: "STAT#TOTAL",
                TotalWorkouts: 5,
                TotalVolume: 10000,
            },
            {
                UserId: userId,
                SK: "EX#bench_press",
                Best1RM: 150,
            },
            {
                UserId: userId,
                SK: "EX#squat",
                Best1RM: 200,
            },
        ]);

        const result = await getStatsLogic(userId);

        expect(mockedQuery).toHaveBeenCalledWith(
            {
                pkName: "UserId",
                pk: userId,
            },
            "user-stats",
        );
        expect(result).toEqual({
            total: { TotalWorkouts: 5, TotalVolume: 10000 },
            exercises: {
                bench_press: { Best1RM: 150 },
                squat: { Best1RM: 200 },
            },
        });
    });

    it("returns empty objects when no stats exist", async () => {
        mockedQuery.mockResolvedValue([]);

        const result = await getStatsLogic(userId);

        expect(result).toEqual({ total: {}, exercises: {} });
    });
});
