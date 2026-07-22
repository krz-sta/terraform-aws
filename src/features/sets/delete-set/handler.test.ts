import crypto from "crypto";
import { handler } from "./handler.js";
import { get, put } from "../../shared/services/db-client.service.js";
import {
    ACTIVE_SESSIONS_TABLE,
    cleanupUser,
    makeTestUserId,
    ttlSoon,
} from "../../../test-utils/aws.js";

function makeEvent(body: Record<string, unknown>) {
    return {
        httpMethod: "DELETE",
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

describe("delete-set handler", () => {
    const userId = makeTestUserId();

    afterAll(async () => {
        await cleanupUser(userId);
    });

    it("returns 200 on success", async () => {
        const sessionId = crypto.randomUUID();
        await put(
            {
                UserId: userId,
                SessionId: sessionId,
                Exercises: {
                    bench_press: { Sets: [{ weight: 100, reps: 5 }] },
                },
                TimeToExist: ttlSoon(),
            },
            ACTIVE_SESSIONS_TABLE,
        );

        const response = await invoke(
            makeEvent({
                userId,
                sessionId,
                exerciseName: "bench_press",
                setIndex: 0,
            }),
        );

        expect(response.statusCode).toBe(200);
        expect(JSON.parse(response.body)).toEqual({
            message: "Set deleted successfully.",
        });

        const stored = await get(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SessionId",
                sk: sessionId,
            },
            ACTIVE_SESSIONS_TABLE,
        );
        expect(stored?.Exercises).toEqual({
            bench_press: { Sets: [] },
        });
    });

    it("returns 400 for negative setIndex", async () => {
        const response = await invoke(
            makeEvent({
                userId,
                sessionId: crypto.randomUUID(),
                exerciseName: "bench_press",
                setIndex: -1,
            }),
        );

        expect(response.statusCode).toBe(400);
    });
});
