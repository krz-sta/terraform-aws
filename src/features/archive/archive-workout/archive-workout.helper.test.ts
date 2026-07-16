import { jest } from "@jest/globals";

jest.unstable_mockModule("./archive-workout.service.js", () => ({
    saveWorkoutSnapshot: jest.fn(),
}));

const { archiveWorkoutSnapshots, collectWorkoutSnapshots } =
    await import("./archive-workout.helper.js");
const { saveWorkoutSnapshot } = await import("./archive-workout.service.js");
const mockedSaveWorkoutSnapshot = saveWorkoutSnapshot as jest.MockedFunction<
    typeof saveWorkoutSnapshot
>;

const snapshot = {
    UserId: "user-123",
    SessionId: "session-456",
    StartTime: "2026-07-13T08:00:00.000Z",
    EndTime: "2026-07-13T09:00:00.000Z",
    TimeToExist: 1234567890,
    Exercises: {},
};

describe("archive workout helpers", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("extracts a workout snapshot from an SNS-wrapped DynamoDB event", () => {
        const event = {
            Records: [
                {
                    body: JSON.stringify({
                        Message: JSON.stringify({
                            Records: [
                                {
                                    dynamodb: {
                                        NewImage: {
                                            UserId: { S: snapshot.UserId },
                                            SessionId: {
                                                S: snapshot.SessionId,
                                            },
                                            StartTime: {
                                                S: snapshot.StartTime,
                                            },
                                            EndTime: { S: snapshot.EndTime },
                                            TimeToExist: {
                                                N: String(snapshot.TimeToExist),
                                            },
                                            Exercises: { M: {} },
                                        },
                                    },
                                },
                            ],
                        }),
                    }),
                },
            ],
        } as any;

        expect(collectWorkoutSnapshots(event)).toEqual([snapshot]);
    });

    it("builds the user-scoped archive key", async () => {
        mockedSaveWorkoutSnapshot.mockResolvedValue(undefined);

        await archiveWorkoutSnapshots([snapshot]);

        expect(mockedSaveWorkoutSnapshot).toHaveBeenCalledWith(
            "user-123/2026/7/13/session-456.parquet",
            snapshot,
        );
    });
});
