import {
    buildSessionsForStats,
    calculateSessionStats,
} from "./update-stats.helper.js";
import { get, put } from "../../shared/services/db-client.service.js";
import {
    USER_STATS_TABLE,
    cleanupUsers,
    makeTestUserId,
} from "../../../test-utils/aws.js";

describe("buildSessionsForStats", () => {
    it("extracts a session from a DynamoDB stream event", () => {
        const event = {
            Records: [
                {
                    body: JSON.stringify({
                        Records: [
                            {
                                dynamodb: {
                                    NewImage: {
                                        UserId: { S: "user-123" },
                                        Exercises: {
                                            M: {
                                                squat: {
                                                    M: {
                                                        Sets: {
                                                            L: [
                                                                {
                                                                    M: {
                                                                        weight: {
                                                                            N: "100",
                                                                        },
                                                                        reps: {
                                                                            N: "5",
                                                                        },
                                                                    },
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                            },
                                        },
                                    },
                                },
                            },
                        ],
                    }),
                },
            ],
        };

        const sessions = buildSessionsForStats(event as any);

        expect(sessions).toEqual([
            {
                userId: "user-123",
                exercises: {
                    squat: {
                        Sets: [{ weight: 100, reps: 5 }],
                    },
                },
            },
        ]);
    });

    it("returns an empty array for an empty event", () => {
        expect(buildSessionsForStats({ Records: [] } as any)).toEqual([]);
    });

    it("skips malformed records", () => {
        const event = {
            Records: [
                {
                    body: JSON.stringify({
                        Records: [{ eventName: "INSERT" }],
                    }),
                },
                { body: "notjson" },
            ],
        };

        expect(buildSessionsForStats(event as any)).toEqual([]);
    });
});

describe("calculateSessionStats", () => {
    const testUsers: string[] = [];

    function newTestUser() {
        const userId = makeTestUserId();
        testUsers.push(userId);
        return userId;
    }

    function exerciseKey(userId: string, exerciseName: string) {
        return {
            pkName: "UserId",
            pk: userId,
            skName: "SK",
            sk: `EX#${exerciseName}`,
        };
    }

    function totalKey(userId: string) {
        return {
            pkName: "UserId",
            pk: userId,
            skName: "SK",
            sk: "STAT#TOTAL",
        };
    }

    afterAll(async () => {
        await cleanupUsers(testUsers);
    });

    it("calculates and persists weighted-exercise stats and total stats", async () => {
        const userId = newTestUser();
        const sessions = [
            {
                userId,
                exercises: {
                    bench_press: {
                        Sets: [{ weight: 100, reps: 5 }],
                    },
                },
            },
        ];

        await calculateSessionStats(sessions as any);

        const exerciseStats = await get(
            exerciseKey(userId, "bench_press"),
            USER_STATS_TABLE,
        );
        expect(exerciseStats?.Best1RM as number).toBeCloseTo(116.67, 2);
        expect(exerciseStats).toEqual(
            expect.objectContaining({
                BestVolume: 500,
                BestWeight: 100,
            }),
        );

        await expect(get(totalKey(userId), USER_STATS_TABLE)).resolves.toEqual(
            expect.objectContaining({
                TotalWorkouts: 1,
                TotalVolume: 500,
                TotalReps: 5,
            }),
        );
    });

    it("calculates body-weight exercise stats using MaxReps", async () => {
        const userId = newTestUser();
        const sessions = [
            {
                userId,
                exercises: {
                    pull_up: {
                        Sets: [{ weight: 0, reps: 12 }],
                    },
                },
            },
        ];

        await calculateSessionStats(sessions as any);

        await expect(
            get(exerciseKey(userId, "pull_up"), USER_STATS_TABLE),
        ).resolves.toEqual(expect.objectContaining({ MaxReps: 12 }));
        await expect(get(totalKey(userId), USER_STATS_TABLE)).resolves.toEqual(
            expect.objectContaining({
                TotalWorkouts: 1,
                TotalVolume: 0,
                TotalReps: 12,
            }),
        );
    });

    it("normalizes lowercase 'sets'", async () => {
        const userId = newTestUser();
        const sessions = [
            {
                userId,
                exercises: {
                    deadlift: {
                        sets: [{ Weight: 140, Reps: 3 }],
                    },
                },
            },
        ];

        await calculateSessionStats(sessions as any);

        await expect(
            get(exerciseKey(userId, "deadlift"), USER_STATS_TABLE),
        ).resolves.toEqual(expect.objectContaining({ BestWeight: 140 }));
    });

    it("keeps existing personal bests when the session does not exceed them", async () => {
        const userId = newTestUser();
        await put(
            {
                UserId: userId,
                SK: "EX#squat",
                Best1RM: 200,
                BestVolume: 1000,
                BestWeight: 200,
            },
            USER_STATS_TABLE,
        );

        const sessions = [
            {
                userId,
                exercises: {
                    squat: {
                        Sets: [{ weight: 100, reps: 5 }],
                    },
                },
            },
        ];

        await calculateSessionStats(sessions as any);

        await expect(
            get(exerciseKey(userId, "squat"), USER_STATS_TABLE),
        ).resolves.toEqual(
            expect.objectContaining({
                Best1RM: 200,
                BestVolume: 1000,
                BestWeight: 200,
            }),
        );
    });

    it("handles multiple exercises in one session", async () => {
        const userId = newTestUser();
        const sessions = [
            {
                userId,
                exercises: {
                    squat: {
                        Sets: [{ weight: 100, reps: 5 }],
                    },
                    pull_up: {
                        Sets: [{ weight: 0, reps: 10 }],
                    },
                },
            },
        ];

        await calculateSessionStats(sessions as any);

        await expect(
            get(exerciseKey(userId, "squat"), USER_STATS_TABLE),
        ).resolves.not.toBeNull();
        await expect(
            get(exerciseKey(userId, "pull_up"), USER_STATS_TABLE),
        ).resolves.not.toBeNull();
        await expect(get(totalKey(userId), USER_STATS_TABLE)).resolves.toEqual(
            expect.objectContaining({
                TotalWorkouts: 1,
                TotalVolume: 500,
                TotalReps: 15,
            }),
        );
    });
});
