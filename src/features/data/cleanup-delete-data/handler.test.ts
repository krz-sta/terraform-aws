import { jest } from "@jest/globals";

jest.unstable_mockModule(
    "../delete-user-data/delete-user-data.helper.js",
    () => ({
        deleteUserData: jest.fn(),
    }),
);

const { handler } = await import("./handler.js");
const { deleteUserData } =
    await import("../delete-user-data/delete-user-data.helper.js");
const mockedDeleteUserData = deleteUserData as jest.MockedFunction<
    typeof deleteUserData
>;

const invoke = async (event: unknown) =>
    (await handler(event as any, {} as any, undefined as any))!;

describe("cleanup-delete-data handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("delegates to deleteUserData", async () => {
        mockedDeleteUserData.mockResolvedValue({
            userId: "user-123",
            deleted: {
                sessionHistory: 0,
                userStats: 0,
                archiveObjects: 0,
            },
        });

        await expect(invoke({ userId: "user-123" })).resolves.toEqual({
            userId: "user-123",
            deleted: {
                sessionHistory: 0,
                userStats: 0,
                archiveObjects: 0,
            },
        });

        expect(mockedDeleteUserData).toHaveBeenCalledWith("user-123");
    });

    it("rejects missing userId", async () => {
        await expect(invoke({})).rejects.toThrow(
            "Missing required field: userId",
        );
    });
});
