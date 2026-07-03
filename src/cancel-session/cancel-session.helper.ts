import { NotFoundError } from "../helpers/error.helper.js";
import { deleteCmd } from "../services/db-client.service.js";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;

if (!ACTIVE_SESSIONS_TABLE_NAME) {
    throw new Error("Missing environment variable.");
}

export const cancelSessionLogic = async (userId: string, sessionId: string) => {
    try {
        await deleteCmd(
            "UserId",
            userId,
            "SessionId",
            sessionId,
            ACTIVE_SESSIONS_TABLE_NAME,
        );
    } catch (e: any) {
        if (e.name === "ConditionalCheckFailedException") {
            throw new NotFoundError("Session not found.");
        }
        throw e;
    }
};
