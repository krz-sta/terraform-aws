import { jest } from "@jest/globals";

jest.unstable_mockModule("./start-delete-data.helper.js", () => ({
    startDeleteDataWorkflow: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { startDeleteDataWorkflow } =
    await import("./start-delete-data.helper.js");
const mockedStartDeleteDataWorkflow =
    startDeleteDataWorkflow as jest.MockedFunction<
        typeof startDeleteDataWorkflow
    >;

function makeEvent(userId?: string) {
    return {
        httpMethod: "DELETE",
        path: "/delete-data",
        headers: {},
        queryStringParameters: {},
        body: null,
        requestContext: userId
            ? { authorizer: { claims: { sub: userId } } }
            : {},
    } as any;
}

const invoke = async (event: unknown) =>
    (await handler(event as any, {} as any, undefined as any))!;

describe("start-delete-data handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns 200 when data is deleted", async () => {
        mockedStartDeleteDataWorkflow.mockResolvedValue({
            message: "User data deleted successfully.",
        });

        const response = await invoke(makeEvent("user-123"));

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            message: "User data deleted successfully.",
        });
        expect(mockedStartDeleteDataWorkflow).toHaveBeenCalledWith("user-123");
    });

    it("returns 400 when the authenticated user is missing", async () => {
        const response = await invoke(makeEvent());

        expect(response.statusCode).toBe(400);
        expect(mockedStartDeleteDataWorkflow).not.toHaveBeenCalled();
    });
});
