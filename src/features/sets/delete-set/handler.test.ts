import { jest } from "@jest/globals";

jest.unstable_mockModule("./delete-set.helper.js", () => ({
    deleteSetLogic: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { deleteSetLogic } = await import("./delete-set.helper.js");

const mockedDeleteSetLogic = deleteSetLogic as jest.MockedFunction<
    typeof deleteSetLogic
>;

function makeEvent(body: Record<string, unknown>) {
    return {
        httpMethod: "DELETE",
        path: "/sets",
        headers: { "Content-Type": "application/json" },
        queryStringParameters: null,
        body: JSON.stringify(body),
        requestContext: {
            authorizer: {
                claims: { sub: body.userId },
            },
        },
    } as any;
}

const invoke = (event: any): any => handler(event, {} as any, undefined as any);

describe("delete-set handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns 200 on success", async () => {
        mockedDeleteSetLogic.mockResolvedValue(undefined);

        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
                setIndex: 0,
            }),
        );

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            message: "Set deleted successfully.",
        });
        expect(mockedDeleteSetLogic).toHaveBeenCalledWith(
            "user-123",
            "session-456",
            "bench_press",
            0,
        );
    });

    it("returns 400 for negative setIndex", async () => {
        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
                setIndex: -1,
            }),
        );

        expect(response.statusCode).toBe(400);
        expect(mockedDeleteSetLogic).not.toHaveBeenCalled();
    });
});
