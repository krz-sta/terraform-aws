import { jest } from "@jest/globals";

jest.unstable_mockModule("./save-session.helper.js", () => ({
    saveSessionLogic: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { saveSessionLogic } = await import("./save-session.helper.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedSaveSessionLogic = saveSessionLogic as jest.MockedFunction<
    typeof saveSessionLogic
>;

function makeEvent(userId: string, sessionId: string) {
    return {
        httpMethod: "POST",
        path: "/sessions/save",
        headers: {},
        queryStringParameters: { userId, sessionId },
        body: null,
        requestContext: {
            authorizer: {
                claims: { sub: userId },
            },
        },
    } as any;
}

const invoke = (event: any): any => handler(event, {} as any, undefined as any);

describe("save-session handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns 200 on success", async () => {
        mockedSaveSessionLogic.mockResolvedValue(undefined);

        const response = await invoke(makeEvent("user-123", "session-456"));

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            message: "Session ended and saved successfully.",
        });
    });

    it("returns 404 when the session is not found", async () => {
        mockedSaveSessionLogic.mockRejectedValue(
            new NotFoundError("Session not found."),
        );

        const response = await invoke(makeEvent("user-123", "session-456"));

        expect(response.statusCode).toBe(404);
        expect(JSON.parse(response.body).message).toBe("Session not found.");
    });

    it("returns 400 when sessionId is missing", async () => {
        const response = await invoke({
            ...makeEvent("user-123", "session-456"),
            queryStringParameters: { userId: "user-123" },
        });

        expect(response.statusCode).toBe(400);
    });
});
