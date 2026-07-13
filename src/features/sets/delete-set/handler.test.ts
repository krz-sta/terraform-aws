import { jest } from "@jest/globals";

jest.unstable_mockModule("./delete-set.helper.js", () => ({
    deleteSetLogic: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { deleteSetLogic } = await import("./delete-set.helper.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedDeleteSetLogic = deleteSetLogic as jest.MockedFunction<
    typeof deleteSetLogic
>;

function makeEvent(
    userId: string,
    sessionId: string,
    exerciseName: string,
    setIndex: number,
) {
    return {
        httpMethod: "DELETE",
        path: "/sets",
        headers: {},
        queryStringParameters: {
            userId,
            sessionId,
            exerciseName,
            setIndex: String(setIndex),
        },
        body: null,
        requestContext: {
            authorizer: {
                claims: { sub: userId },
            },
        },
    } as any;
}

function makeEventWithTypedInput(
    userId: string,
    sessionId: string,
    exerciseName: string,
    setIndex: number,
) {
    return {
        httpMethod: "DELETE",
        path: "/sets",
        headers: {},
        queryStringParameters: { userId, sessionId, exerciseName },
        input: { userId, sessionId, exerciseName, setIndex },
        body: null,
        requestContext: {
            authorizer: {
                claims: { sub: userId },
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
            makeEventWithTypedInput(
                "user-123",
                "session-456",
                "bench_press",
                0,
            ),
        );

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            message: "Set deleted successfully.",
        });
    });

    it("returns 400 for string setIndex in query parameters", async () => {
        const response = await invoke(
            makeEvent("user-123", "session-456", "bench_press", 0),
        );

        expect(response.statusCode).toBe(400);
    });

    it("returns 400 for negative setIndex", async () => {
        const response = await invoke(
            makeEventWithTypedInput(
                "user-123",
                "session-456",
                "bench_press",
                -1,
            ),
        );

        expect(response.statusCode).toBe(400);
    });

    it("returns 404 when the set is not found", async () => {
        mockedDeleteSetLogic.mockRejectedValue(
            new NotFoundError("Set not found."),
        );

        const response = await invoke(
            makeEventWithTypedInput(
                "user-123",
                "session-456",
                "bench_press",
                5,
            ),
        );

        expect(response.statusCode).toBe(404);
    });
});
