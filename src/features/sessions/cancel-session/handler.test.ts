import { jest } from "@jest/globals";

jest.unstable_mockModule("./cancel-session.helper.js", () => ({
    cancelSessionLogic: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { cancelSessionLogic } = await import("./cancel-session.helper.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedCancelSessionLogic = cancelSessionLogic as jest.MockedFunction<
    typeof cancelSessionLogic
>;

function makeEvent(userId: string, sessionId: string) {
    return {
        httpMethod: "POST",
        path: "/sessions/cancel",
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

describe("cancel-session handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns 200 on success", async () => {
        mockedCancelSessionLogic.mockResolvedValue(undefined);

        const response = await invoke(makeEvent("user-123", "session-456"));

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            message: "Session canceled successfully.",
        });
    });

    it("returns 404 when the session is not found", async () => {
        mockedCancelSessionLogic.mockRejectedValue(
            new NotFoundError("Session not found."),
        );

        const response = await invoke(makeEvent("user-123", "session-456"));

        expect(response.statusCode).toBe(404);
    });
});
