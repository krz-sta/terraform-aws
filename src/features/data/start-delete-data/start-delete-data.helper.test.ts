import { jest } from "@jest/globals";

const mockedSend = jest.fn<any>();

jest.unstable_mockModule("@aws-sdk/client-sfn", () => ({
    SFNClient: jest.fn(() => ({ send: mockedSend })),
    StartSyncExecutionCommand: jest.fn((input: unknown) => input),
}));

const { startDeleteDataWorkflow } =
    await import("./start-delete-data.helper.js");
const { StartSyncExecutionCommand } = await import("@aws-sdk/client-sfn");
const { ConflictError } = await import("../../shared/helpers/error.helper.js");

describe("startDeleteDataWorkflow", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns an informative success result", async () => {
        mockedSend.mockResolvedValue({
            status: "SUCCEEDED",
            output: JSON.stringify({
                status: "DELETED",
                message: "User data deleted successfully.",
            }),
        });

        await expect(startDeleteDataWorkflow("user-123")).resolves.toEqual({
            message: "User data deleted successfully.",
        });
        expect(StartSyncExecutionCommand).toHaveBeenCalledWith({
            stateMachineArn:
                "arn:aws:states:eu-central-1:123456789012:stateMachine:delete-data-placeholder",
            input: JSON.stringify({ userId: "user-123" }),
        });
    });

    it("throws conflict when the workflow is blocked", async () => {
        mockedSend.mockResolvedValue({
            status: "SUCCEEDED",
            output: JSON.stringify({
                status: "BLOCKED",
                message:
                    "Data cannot be deleted while an active session exists.",
            }),
        });

        await expect(startDeleteDataWorkflow("user-123")).rejects.toThrow(
            ConflictError,
        );
    });

    it("throws conflict when the delete-task recheck finds a session", async () => {
        mockedSend.mockResolvedValue({
            status: "FAILED",
            cause: JSON.stringify({
                errorMessage:
                    "Data cannot be deleted while an active session exists.",
            }),
        });

        await expect(startDeleteDataWorkflow("user-123")).rejects.toThrow(
            ConflictError,
        );
    });

    it("returns a generic error for unexpected workflow failures", async () => {
        mockedSend.mockResolvedValue({
            status: "FAILED",
            cause: JSON.stringify({ message: "Internal storage failure." }),
        });

        await expect(startDeleteDataWorkflow("user-123")).rejects.toMatchObject(
            {
                message: "User data could not be deleted.",
                statusCode: 500,
            },
        );
    });
});
