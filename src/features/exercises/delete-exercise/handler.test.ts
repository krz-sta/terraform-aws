import { jest } from "@jest/globals";

jest.unstable_mockModule("./delete-exercise.helper.js", () => ({
    deleteExerciseLogic: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { deleteExerciseLogic } = await import("./delete-exercise.helper.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedDeleteExerciseLogic = deleteExerciseLogic as jest.MockedFunction<
    typeof deleteExerciseLogic
>;

function makeEvent(body: Record<string, unknown>) {
    return {
        httpMethod: "DELETE",
        path: "/exercises",
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

describe("delete-exercise handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns 200 on success", async () => {
        mockedDeleteExerciseLogic.mockResolvedValue(undefined);

        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
            }),
        );

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            message: "Exercise deleted successfully.",
        });
    });

    it("returns 404 when the session is not found", async () => {
        mockedDeleteExerciseLogic.mockRejectedValue(
            new NotFoundError("Session not found."),
        );

        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
            }),
        );

        expect(response.statusCode).toBe(404);
    });

    it("returns 404 when the exercise is not found", async () => {
        mockedDeleteExerciseLogic.mockRejectedValue(
            new NotFoundError("Exercise not found."),
        );

        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
            }),
        );

        expect(response.statusCode).toBe(404);
    });
});
