import { jest } from "@jest/globals";

jest.unstable_mockModule("./delete-user-data.helper.js", () => ({
    deleteUserData: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { deleteUserData } = await import("./delete-user-data.helper.js");
const mockedDeleteUserData = deleteUserData as jest.MockedFunction<
    typeof deleteUserData
>;

const invoke = (event: any): any => handler(event, {} as any, undefined as any);

describe("delete-user-data handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns the deletion result", async () => {
        const result = {
            userId: "user-123",
            deleted: {
                sessionHistory: 2,
                userStats: 1,
                archiveObjects: 3,
            },
        };
        mockedDeleteUserData.mockResolvedValue(result);

        await expect(invoke({ userId: "user-123" })).resolves.toEqual(result);

        expect(mockedDeleteUserData).toHaveBeenCalledWith("user-123");
    });

    it("rejects missing userId", async () => {
        await expect(invoke({})).rejects.toThrow(
            "Missing required field: userId",
        );
        expect(mockedDeleteUserData).not.toHaveBeenCalled();
    });
});
