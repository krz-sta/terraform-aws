import crypto from "crypto";
import { getSessionLogic } from "./get-session.helper.js";
import { put } from "../../shared/services/db-client.service.js";
import { NotFoundError } from "../../shared/helpers/error.helper.js";
import {
    ACTIVE_SESSIONS_TABLE,
    cleanupUser,
    makeTestUserId,
    ttlSoon,
} from "../../../test-utils/aws.js";

describe("getSessionLogic", () => {
    const userId = makeTestUserId();
    const sessionId = crypto.randomUUID();

    afterAll(async () => {
        await cleanupUser(userId);
    });

    it("returns the session when it exists", async () => {
        const session = {
            UserId: userId,
            SessionId: sessionId,
            StartTime: "2026-07-13T08:00:00.000Z",
            TimeToExist: ttlSoon(),
        };
        await put(session, ACTIVE_SESSIONS_TABLE);

        const result = await getSessionLogic(userId, sessionId);

        expect(result).toEqual(session);
    });

    it("throws NotFoundError when the session does not exist", async () => {
        await expect(
            getSessionLogic(userId, crypto.randomUUID()),
        ).rejects.toBeInstanceOf(NotFoundError);
    });
});
