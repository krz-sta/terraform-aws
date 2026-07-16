import { jest } from "@jest/globals";

const mockedS3Send = jest.fn<any>();

jest.unstable_mockModule("@aws-sdk/client-s3", () => ({
    S3Client: jest.fn(() => ({ send: mockedS3Send })),
    ListObjectsV2Command: jest.fn((input: unknown) => input),
    DeleteObjectsCommand: jest.fn((input: unknown) => input),
}));

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    query: jest.fn(),
    delete: jest.fn(),
}));

const { deleteUserData } = await import("./delete-user-data.helper.js");
const dbService = await import("../../shared/services/db-client.service.js");

const mockedQuery = dbService.query as jest.MockedFunction<
    typeof dbService.query
>;
const mockedDelete = dbService.delete as jest.MockedFunction<
    typeof dbService.delete
>;

describe("deleteUserData", () => {
    beforeEach(() => {
        jest.resetAllMocks();
        mockedS3Send
            .mockResolvedValueOnce({
                Contents: [{ Key: "user-123/2026/7/15/session-a.parquet" }],
            })
            .mockResolvedValueOnce({
                Deleted: [{ Key: "user-123/2026/7/15/session-a.parquet" }],
            });
    });

    it("deletes all related user records across tables", async () => {
        mockedQuery
            .mockResolvedValueOnce([] as any)
            .mockResolvedValueOnce([
                { UserId: "user-123", SessionId: "history-1" },
                { UserId: "user-123", SessionId: "history-2" },
            ] as any)
            .mockResolvedValueOnce([
                { UserId: "user-123", SK: "STAT#TOTAL" },
            ] as any);

        await expect(deleteUserData("user-123")).resolves.toEqual({
            userId: "user-123",
            deleted: {
                sessionHistory: 2,
                userStats: 1,
                archiveObjects: 1,
            },
        });

        expect(mockedDelete).toHaveBeenCalledTimes(3);
        expect(mockedS3Send).toHaveBeenCalledTimes(2);
    });

    it("does not delete data while an active session exists", async () => {
        mockedQuery.mockResolvedValueOnce([
            { UserId: "user-123", SessionId: "active-1" },
        ] as any);

        await expect(deleteUserData("user-123")).rejects.toThrow(
            "Data cannot be deleted while an active session exists.",
        );

        expect(mockedQuery).toHaveBeenCalledTimes(1);
        expect(mockedDelete).not.toHaveBeenCalled();
        expect(mockedS3Send).not.toHaveBeenCalled();
    });

    it("rejects archives that exceed the project limit", async () => {
        mockedS3Send.mockReset();
        mockedS3Send.mockResolvedValueOnce({ IsTruncated: true });

        mockedQuery
            .mockResolvedValueOnce([] as any)
            .mockResolvedValueOnce([] as any)
            .mockResolvedValueOnce([] as any);

        await expect(deleteUserData("user-123")).rejects.toThrow(
            "S3 archive exceeded the 1,000-object limit.",
        );
        expect(mockedS3Send).toHaveBeenCalledTimes(1);
    });

    it("fails when S3 reports undeleted objects", async () => {
        mockedS3Send.mockReset();
        mockedS3Send
            .mockResolvedValueOnce({
                Contents: [{ Key: "user-123/archive.parquet" }],
                IsTruncated: false,
            })
            .mockResolvedValueOnce({
                Errors: [{ Key: "user-123/archive.parquet" }],
            });

        mockedQuery
            .mockResolvedValueOnce([] as any)
            .mockResolvedValueOnce([] as any)
            .mockResolvedValueOnce([] as any);

        await expect(deleteUserData("user-123")).rejects.toThrow(
            "Failed to delete 1 archive object(s).",
        );
    });
});
