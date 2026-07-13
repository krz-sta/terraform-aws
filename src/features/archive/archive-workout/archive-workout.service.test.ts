import { jest } from "@jest/globals";

const mockedSend = jest.fn<any>();
const mockedAppendRow = jest.fn<any>();
const mockedClose = jest.fn<any>();
const mockedOpenFile = jest.fn<any>();
const mockedReadFileSync = jest.fn<any>();
const mockedExistsSync = jest.fn<any>();
const mockedUnlinkSync = jest.fn<any>();

jest.unstable_mockModule("@aws-sdk/client-s3", () => ({
    S3Client: jest.fn(() => ({ send: mockedSend })),
    PutObjectCommand: jest.fn((input) => input),
}));

jest.unstable_mockModule("@dsnp/parquetjs", () => ({
    ParquetSchema: jest.fn(),
    ParquetWriter: {
        openFile: mockedOpenFile,
    },
}));

jest.unstable_mockModule("fs", () => ({
    default: {
        readFileSync: mockedReadFileSync,
        existsSync: mockedExistsSync,
        unlinkSync: mockedUnlinkSync,
    },
    readFileSync: mockedReadFileSync,
    existsSync: mockedExistsSync,
    unlinkSync: mockedUnlinkSync,
}));

const { saveWorkoutSnapshot } = await import("./archive-workout.service.js");
const { PutObjectCommand } = await import("@aws-sdk/client-s3");

describe("saveWorkoutSnapshot", () => {
    const workout = {
        UserId: "user-123",
        SessionId: "session-456",
        StartTime: "2026-07-13T08:00:00.000Z",
        EndTime: "2026-07-13T09:00:00.000Z",
        TimeToExist: 1234567890,
        Exercises: { bench_press: { Sets: [{ weight: 100, reps: 5 }] } },
    };

    beforeEach(() => {
        jest.resetAllMocks();
        mockedOpenFile.mockResolvedValue({
            appendRow: mockedAppendRow,
            close: mockedClose,
        });
        mockedReadFileSync.mockReturnValue(Buffer.from("parquet-data"));
        mockedExistsSync.mockReturnValue(true);
        mockedSend.mockResolvedValue(undefined);
    });

    it("builds a parquet buffer and uploads it to S3", async () => {
        await saveWorkoutSnapshot(
            "user-123/2026/7/13/session-456.parquet",
            workout,
        );

        expect(mockedAppendRow).toHaveBeenCalledWith(
            expect.objectContaining({
                UserId: "user-123",
                SessionId: "session-456",
                ExercisesJson: JSON.stringify(workout.Exercises),
            }),
        );
        expect(mockedClose).toHaveBeenCalled();
        expect(mockedUnlinkSync).toHaveBeenCalled();
        expect(mockedSend).toHaveBeenCalled();
        expect(PutObjectCommand).toHaveBeenCalledWith(
            expect.objectContaining({
                Bucket: "workouts-archive",
                Key: "user-123/2026/7/13/session-456.parquet",
                ContentType: "application/octet-stream",
            }),
        );
    });
});
