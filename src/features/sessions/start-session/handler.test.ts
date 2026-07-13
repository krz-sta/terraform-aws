import { jest } from "@jest/globals";

jest.unstable_mockModule("./start-session.helper.js", () => ({
    startSessionLogic: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { startSessionLogic } = await import("./start-session.helper.js");
const { ConflictError } = await import("../../shared/helpers/error.helper.js");

const mockedStartSessionLogic = startSessionLogic as jest.MockedFunction<
    typeof startSessionLogic
>;

function makeEvent(userId: string) {
    return {
        httpMethod: "POST",
        path: "/sessions",
        headers: {},
        queryStringParameters: { userId },
        body: null,
        requestContext: {
            authorizer: {
                claims: { sub: userId },
            },
        },
    } as any;
}

const invoke = (event: any): any => handler(event, {} as any, undefined as any);

describe("start-session handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns 200 with a sessionId", async () => {
        mockedStartSessionLogic.mockResolvedValue(
            "new-session-id" as `${string}-${string}-${string}-${string}-${string}`,
        );

        const response = await invoke(makeEvent("user-123"));

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            sessionId: "new-session-id",
        });
    });

    it("returns 400 when userId is missing", async () => {
        const response = await invoke({
            httpMethod: "POST",
            path: "/sessions",
            headers: {},
            queryStringParameters: {},
            body: null,
            requestContext: {},
        });

        expect(response.statusCode).toBe(400);
        expect(JSON.parse(response.body).message).toBe(
            "Schema validation failed.",
        );
    });

    it("returns 409 when user already has an active session", async () => {
        mockedStartSessionLogic.mockRejectedValue(
            new ConflictError("User already has an active session.", {
                sessionId: "existing",
            }),
        );

        const response = await invoke(makeEvent("user-123"));

        expect(response.statusCode).toBe(409);
        expect(JSON.parse(response.body).message).toBe(
            "User already has an active session.",
        );
    });
});
