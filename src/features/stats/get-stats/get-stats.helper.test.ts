import { getStatsLogic } from "./get-stats.helper.js";
import { put } from "../../shared/services/db-client.service.js";
import {
    USER_STATS_TABLE,
    cleanupUser,
    makeTestUserId,
} from "../../../test-utils/aws.js";

describe("getStatsLogic", () => {
    const userId = makeTestUserId();

    afterAll(async () => {
        await cleanupUser(userId);
    });

    it("returns total and exercise stats partitioned by SK", async () => {
        await put(
            {
                UserId: userId,
                SK: "STAT#TOTAL",
                TotalWorkouts: 5,
                TotalVolume: 10000,
            },
            USER_STATS_TABLE,
        );
        await put(
            { UserId: userId, SK: "EX#bench_press", Best1RM: 150 },
            USER_STATS_TABLE,
        );
        await put(
            { UserId: userId, SK: "EX#squat", Best1RM: 200 },
            USER_STATS_TABLE,
        );

        const result = await getStatsLogic(userId);

        expect(result).toEqual({
            total: { TotalWorkouts: 5, TotalVolume: 10000 },
            exercises: {
                bench_press: { Best1RM: 150 },
                squat: { Best1RM: 200 },
            },
        });
    });

    it("returns empty objects when no stats exist", async () => {
        const result = await getStatsLogic(makeTestUserId());

        expect(result).toEqual({ total: {}, exercises: {} });
    });
});
