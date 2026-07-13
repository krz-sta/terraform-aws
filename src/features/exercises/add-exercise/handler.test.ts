import { jest } from "@jest/globals";

jest.unstable_mockModule("./add-exercise.helper.js", () => ({
    addExerciseLogic: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { addExerciseLogic } = await import("./add-exercise.helper.js");
const { ConflictError, NotFoundError } =
    await import("../../shared/helpers/error.helper.js");

const mockedAddExerciseLogic = addExerciseLogic as jest.MockedFunction<
    typeof addExerciseLogic
>;

function makeEvent(body: Record<string, unknown>) {
    return {
        httpMethod: "POST",
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

describe("add-exercise handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns 200 on success", async () => {
        mockedAddExerciseLogic.mockResolvedValue(undefined);

        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
            }),
        );

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            message: "Exercise added successfully.",
        });
    });

    it("returns 400 for invalid body", async () => {
        const response = await invoke(makeEvent({ userId: "user-123" }));

        expect(response.statusCode).toBe(400);
    });

    it("returns 404 when the session is not found", async () => {
        mockedAddExerciseLogic.mockRejectedValue(
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

    it("returns 409 when the exercise already exists", async () => {
        mockedAddExerciseLogic.mockRejectedValue(
            new ConflictError("Exercise already exists in the session."),
        );

        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
            }),
        );

        expect(response.statusCode).toBe(409);
    });
});
