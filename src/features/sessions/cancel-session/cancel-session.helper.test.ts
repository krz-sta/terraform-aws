import crypto from "crypto";
import { mockClient } from "aws-sdk-client-mock";
import { DeleteCommand, DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { cancelSessionLogic } from "./cancel-session.helper.js";
import { get, put } from "../../shared/services/db-client.service.js";
import { NotFoundError } from "../../shared/helpers/error.helper.js";
import {
    ACTIVE_SESSIONS_TABLE,
    cleanupUser,
    makeTestUserId,
    ttlSoon,
} from "../../../test-utils/aws.js";

describe("cancelSessionLogic", () => {
    const userId = makeTestUserId();

    afterAll(async () => {
        await cleanupUser(userId);
    });

    it("deletes the active session", async () => {
        const sessionId = crypto.randomUUID();
        await put(
            {
                UserId: userId,
                SessionId: sessionId,
                StartTime: new Date().toISOString(),
                TimeToExist: ttlSoon(),
            },
            ACTIVE_SESSIONS_TABLE,
        );

        await cancelSessionLogic(userId, sessionId);

        const stored = await get(
            {
                pkName: "UserId",
                pk: userId,
                skName: "SessionId",
                sk: sessionId,
            },
            ACTIVE_SESSIONS_TABLE,
        );
        expect(stored).toBeNull();
    });

    it("throws NotFoundError when the session does not exist", async () => {
        await expect(
            cancelSessionLogic(userId, crypto.randomUUID()),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});

describe("cancelSessionLogic (unit, with aws-sdk-client-mock)", () => {
    let ddbMock: ReturnType<typeof mockClient>;

    beforeEach(() => {
        ddbMock = mockClient(DynamoDBDocumentClient);
    });

    afterEach(() => {
        ddbMock.restore();
    });

    it("sends a conditional delete for the active session", async () => {
        ddbMock.on(DeleteCommand).resolves({});

        await cancelSessionLogic("user-123", "session-456");

        const calls = ddbMock.commandCalls(DeleteCommand);
        expect(calls).toHaveLength(1);
        expect(calls[0].args[0].input).toEqual({
            TableName: process.env.ACTIVE_SESSIONS_TABLE_NAME,
            Key: { UserId: "user-123", SessionId: "session-456" },
            ConditionExpression:
                "attribute_exists(#partitionKey) AND attribute_exists(#sortKey)",
            ExpressionAttributeNames: {
                "#partitionKey": "UserId",
                "#sortKey": "SessionId",
            },
        });
    });

    it("throws NotFoundError when the session does not exist", async () => {
        const error = new Error("The conditional request failed");
        error.name = "ConditionalCheckFailedException";
        ddbMock.on(DeleteCommand).rejects(error);

        await expect(
            cancelSessionLogic("user-123", "session-456"),
        ).rejects.toBeInstanceOf(NotFoundError);
    });

    it("rethrows unexpected DynamoDB errors", async () => {
        const error = new Error("Internal server error");
        error.name = "InternalServerError";
        ddbMock.on(DeleteCommand).rejects(error);

        await expect(
            cancelSessionLogic("user-123", "session-456"),
        ).rejects.toThrow("Internal server error");
    });
});
