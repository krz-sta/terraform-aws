import middy from "@middy/core";
import { deleteUserData } from "../delete-user-data/delete-user-data.helper.js";
import type {
    DeleteDataWorkflowInput,
    DeleteUserDataResult,
} from "../../shared/types/data.js";

async function cleanupDeleteDataHandler(
    event: DeleteDataWorkflowInput,
): Promise<DeleteUserDataResult> {
    if (!event.userId) {
        throw new Error("Missing required field: userId");
    }

    return deleteUserData(event.userId);
}

export const handler = middy<
    DeleteDataWorkflowInput,
    DeleteUserDataResult
>().handler(cleanupDeleteDataHandler);
