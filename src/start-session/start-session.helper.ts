import crypto from "crypto";
import { querySessionByUserId, startSession } from "./start-session.service.js";
import { ConflictError } from "../helpers/error.helper.js";

export const startSessionLogic = async (userId: string) => {
    const existing = await querySessionByUserId(userId);
    if (existing) {
        throw new ConflictError("User already has an active session.", {
            sessionId: existing.SessionId,
        });
    }

    const sessionId = crypto.randomUUID();
    const ttl = Date.now() / 1000 + 8 * 3600;

    await startSession(userId, sessionId, ttl);

    return sessionId;
};
