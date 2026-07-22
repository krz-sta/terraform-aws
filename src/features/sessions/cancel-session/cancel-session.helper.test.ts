import crypto from "crypto";
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
