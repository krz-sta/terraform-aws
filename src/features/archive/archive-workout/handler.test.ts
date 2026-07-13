import { jest } from "@jest/globals";

jest.unstable_mockModule("./archive-workout.helper.js", () => ({
    archiveWorkoutSnapshots: jest.fn(),
    collectWorkoutSnapshots: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { archiveWorkoutSnapshots, collectWorkoutSnapshots } =
    await import("./archive-workout.helper.js");

const mockedCollect = collectWorkoutSnapshots as jest.MockedFunction<
    typeof collectWorkoutSnapshots
>;
const mockedArchive = archiveWorkoutSnapshots as jest.MockedFunction<
    typeof archiveWorkoutSnapshots
>;

describe("archive-workout handler", () => {
    const sqsEvent = { Records: [{ body: "{}" }] } as any;

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("archives collected snapshots", async () => {
        const snapshots = [{ UserId: "user-123" } as any];
        mockedCollect.mockReturnValue(snapshots);
        mockedArchive.mockResolvedValue(undefined);

        await handler(sqsEvent);

        expect(mockedCollect).toHaveBeenCalledWith(sqsEvent);
        expect(mockedArchive).toHaveBeenCalledWith(snapshots);
    });

    it("does nothing when no snapshots are collected", async () => {
        mockedCollect.mockReturnValue([]);
        mockedArchive.mockResolvedValue(undefined);

        await handler(sqsEvent);

        expect(mockedArchive).toHaveBeenCalledWith([]);
    });

    it("throws when archiving fails", async () => {
        mockedCollect.mockReturnValue([{} as any]);
        mockedArchive.mockRejectedValue(new Error("S3 error"));

        await expect(handler(sqsEvent)).rejects.toThrow("S3 error");
    });
});
