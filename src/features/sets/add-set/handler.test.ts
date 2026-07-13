import { jest } from "@jest/globals";

jest.unstable_mockModule("./add-set.helper.js", () => ({
    addSetLogic: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { addSetLogic } = await import("./add-set.helper.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedAddSetLogic = addSetLogic as jest.MockedFunction<
    typeof addSetLogic
>;

function makeEvent(body: Record<string, unknown>) {
    return {
        httpMethod: "POST",
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

describe("add-set handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns 200 on success", async () => {
        mockedAddSetLogic.mockResolvedValue(undefined);

        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
                setData: { weight: 100, reps: 5 },
            }),
        );

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            message: "Set added successfully.",
        });
    });

    it("returns 400 for invalid setData", async () => {
        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
                setData: { weight: -10, reps: 5 },
            }),
        );

        expect(response.statusCode).toBe(400);
    });

    it("returns 404 when the session is not found", async () => {
        mockedAddSetLogic.mockRejectedValue(
            new NotFoundError("Session not found."),
        );

        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
                setData: { weight: 100, reps: 5 },
            }),
        );

        expect(response.statusCode).toBe(404);
    });
});
