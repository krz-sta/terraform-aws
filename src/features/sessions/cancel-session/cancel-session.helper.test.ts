import { jest } from "@jest/globals";

jest.unstable_mockModule("../../shared/services/db-client.service.js", () => ({
    delete: jest.fn(),
}));

const { cancelSessionLogic } = await import("./cancel-session.helper.js");
const { delete: deleteItem } =
    await import("../../shared/services/db-client.service.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedDelete = deleteItem as jest.MockedFunction<typeof deleteItem>;

describe("cancelSessionLogic", () => {
    const userId = "user-123";
    const sessionId = "session-456";

    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("deletes the active session", async () => {
        mockedDelete.mockResolvedValue(undefined);

        await cancelSessionLogic(userId, sessionId);

        expect(mockedDelete).toHaveBeenCalledWith(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SessionId",
                sk: sessionId,
            },
            "active-sessions",
        );
    });

    it("throws NotFoundError when the condition check fails", async () => {
        const error = new Error("Conditional check failed") as any;
        error.name = "ConditionalCheckFailedException";
        mockedDelete.mockRejectedValue(error);

        await expect(
            cancelSessionLogic(userId, sessionId),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("rethrows unknown errors", async () => {
        const error = new Error("Network error");
        mockedDelete.mockRejectedValue(error);

        await expect(cancelSessionLogic(userId, sessionId)).rejects.toBe(error);
    });
});
