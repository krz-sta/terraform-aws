import middy from "@middy/core";
import { checkActiveSession } from "./check-active-session.helper.js";
import type {
    CheckActiveSessionResult,
    DeleteDataWorkflowInput,
} from "../../shared/types/data.js";

async function checkActiveSessionHandler(
    event: DeleteDataWorkflowInput,
): Promise<CheckActiveSessionResult> {
    if (!event.userId) {
        throw new Error("Missing required field: userId");
    }

    return checkActiveSession(event.userId);
}

export const handler = middy<
    DeleteDataWorkflowInput,
    CheckActiveSessionResult
>().handler(checkActiveSessionHandler);
