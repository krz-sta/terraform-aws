import { jest } from "@jest/globals";

jest.unstable_mockModule("./get-session.helper.js", () => ({
    getSessionLogic: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { getSessionLogic } = await import("./get-session.helper.js");
const { NotFoundError } = await import("../../shared/helpers/error.helper.js");

const mockedGetSessionLogic = getSessionLogic as jest.MockedFunction<
    typeof getSessionLogic
>;

function makeEvent(userId: string, sessionId: string) {
    return {
        httpMethod: "GET",
        path: "/sessions",
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

describe("get-session handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns 200 with session data", async () => {
        const session = { UserId: "user-123", SessionId: "session-456" };
        mockedGetSessionLogic.mockResolvedValue(session as any);

        const response = await invoke(makeEvent("user-123", "session-456"));

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual(session);
    });

    it("returns 404 when the session is not found", async () => {
        mockedGetSessionLogic.mockRejectedValue(
            new NotFoundError("Session not found."),
        );

        const response = await invoke(makeEvent("user-123", "session-456"));

        expect(response.statusCode).toBe(404);
    });
});
