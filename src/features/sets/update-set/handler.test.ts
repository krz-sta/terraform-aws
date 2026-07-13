import { jest } from "@jest/globals";

jest.unstable_mockModule("./update-set.helper.js", () => ({
    updateSetLogic: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { updateSetLogic } = await import("./update-set.helper.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedUpdateSetLogic = updateSetLogic as jest.MockedFunction<
    typeof updateSetLogic
>;

function makeEvent(body: Record<string, unknown>) {
    return {
        httpMethod: "PUT",
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

describe("update-set handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns 200 on success", async () => {
        mockedUpdateSetLogic.mockResolvedValue(undefined);

        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
                setIndex: 0,
                setData: { weight: 110, reps: 4 },
            }),
        );

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            message: "Set updated successfully.",
        });
    });

    it("returns 400 for negative setIndex", async () => {
        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
                setIndex: -1,
                setData: { weight: 110, reps: 4 },
            }),
        );

        expect(response.statusCode).toBe(400);
    });

    it("returns 404 when the set is not found", async () => {
        mockedUpdateSetLogic.mockRejectedValue(
            new NotFoundError("Set not found."),
        );

        const response = await invoke(
            makeEvent({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
                setIndex: 5,
                setData: { weight: 110, reps: 4 },
            }),
        );

        expect(response.statusCode).toBe(404);
    });
});
