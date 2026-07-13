import { jest } from "@jest/globals";

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    add: jest.fn(),
    get: jest.fn(),
    update: jest.fn(),
}));

const { buildSessionsForStats, calculateSessionStats } =
    await import("./update-stats.helper.js");
const { add, get, update } =
    await import("../../shared/services/db-client.service.js");

const mockedGet = get as jest.MockedFunction<typeof get>;
const mockedUpdate = update as jest.MockedFunction<typeof update>;
const mockedAdd = add as jest.MockedFunction<typeof add>;

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
    const userId = "user-123";

    beforeEach(() => {
        jest.resetAllMocks();
        mockedGet.mockResolvedValue(null);
        mockedUpdate.mockResolvedValue(undefined);
        mockedAdd.mockResolvedValue(undefined);
    });

    it("calculates and persists weighted-exercise stats and total stats", async () => {
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

        expect(mockedUpdate).toHaveBeenCalledWith(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SK",
                sk: "EX#bench_press",
            },
            {
                Best1RM: expect.closeTo(116.67, 2),
                BestVolume: 500,
                BestWeight: 100,
            },
            "user-stats",
        );
        expect(mockedAdd).toHaveBeenCalledWith(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SK",
                sk: "STAT#TOTAL",
            },
            {
                TotalWorkouts: 1,
                TotalVolume: 500,
                TotalReps: 5,
            },
            "user-stats",
        );
    });

    it("calculates body-weight exercise stats using MaxReps", async () => {
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

        expect(mockedUpdate).toHaveBeenCalledWith(
            expect.anything(),
            { MaxReps: 12 },
            "user-stats",
        );
        expect(mockedAdd).toHaveBeenCalledWith(
            expect.anything(),
            {
                TotalWorkouts: 1,
                TotalVolume: 0,
                TotalReps: 12,
            },
            "user-stats",
        );
    });

    it("normalizes lowercase 'sets'", async () => {
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

        expect(mockedUpdate).toHaveBeenCalledWith(
            expect.anything(),
            expect.objectContaining({ BestWeight: 140 }),
            "user-stats",
        );
    });

    it("keeps existing personal bests when the session does not exceed them", async () => {
        mockedGet.mockResolvedValue({
            UserId: userId,
            SK: "EX#squat",
            Best1RM: 200,
            BestVolume: 1000,
            BestWeight: 200,
        });

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

        expect(mockedUpdate).toHaveBeenCalledWith(
            expect.anything(),
            {
                Best1RM: 200,
                BestVolume: 1000,
                BestWeight: 200,
            },
            "user-stats",
        );
    });

    it("handles multiple exercises in one session", async () => {
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

        expect(mockedUpdate).toHaveBeenCalledTimes(2);
        expect(mockedAdd).toHaveBeenCalledWith(
            expect.anything(),
            {
                TotalWorkouts: 1,
                TotalVolume: 500,
                TotalReps: 15,
            },
            "user-stats",
        );
    });
});
