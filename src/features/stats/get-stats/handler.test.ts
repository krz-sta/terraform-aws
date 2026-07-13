import { jest } from "@jest/globals";

jest.unstable_mockModule("./get-stats.helper.js", () => ({
    getStatsLogic: jest.fn(),
}));

const { handler } = await import("./handler.js");
const { getStatsLogic } = await import("./get-stats.helper.js");

const mockedGetStatsLogic = getStatsLogic as jest.MockedFunction<
    typeof getStatsLogic
>;

function makeEvent(userId: string) {
    return {
        httpMethod: "GET",
        path: "/stats",
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

describe("get-stats handler", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns 200 with stats data", async () => {
        const stats = {
            total: { TotalWorkouts: 5 },
            exercises: { bench_press: { Best1RM: 150 } },
        };
        mockedGetStatsLogic.mockResolvedValue(stats);

        const response = await invoke(makeEvent("user-123"));

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual(stats);
    });

    it("returns 400 when userId is missing", async () => {
        const response = await invoke({
            httpMethod: "GET",
            path: "/stats",
            headers: {},
            queryStringParameters: {},
            body: null,
            requestContext: {},
        } as any);

        expect(response.statusCode).toBe(400);
    });
});
