import { SFNClient, StartSyncExecutionCommand } from "@aws-sdk/client-sfn";
import { AppError, ConflictError } from "../../shared/helpers/error.helper.js";
import { requireEnv } from "../../shared/helpers/env.helper.js";
import type {
    DeleteDataWorkflowFailure,
    DeleteDataWorkflowOutput,
} from "../../shared/types/data.js";

const DELETE_DATA_STATE_MACHINE_ARN = requireEnv(
    "DELETE_DATA_STATE_MACHINE_ARN",
);
const sfnClient = new SFNClient({});
const ACTIVE_SESSION_MESSAGE =
    "Data cannot be deleted while an active session exists.";

function parseOutput(output: string): DeleteDataWorkflowOutput {
    try {
        return JSON.parse(output) as DeleteDataWorkflowOutput;
    } catch {
        throw new AppError("Delete-data workflow returned invalid output.");
    }
}

function parseFailureMessage(cause: string | undefined): string {
    if (!cause) {
        return "User data could not be deleted.";
    }

    try {
        const parsed = JSON.parse(cause) as DeleteDataWorkflowFailure;

        if (typeof parsed.errorMessage === "string") {
            return parsed.errorMessage;
        }

        return typeof parsed.message === "string"
            ? parsed.message
            : "User data could not be deleted.";
    } catch {
        return "User data could not be deleted.";
    }
}

export async function startDeleteDataWorkflow(userId: string) {
    const response = await sfnClient.send(
        new StartSyncExecutionCommand({
            stateMachineArn: DELETE_DATA_STATE_MACHINE_ARN,
            input: JSON.stringify({ userId }),
        }),
    );

    if (response.status !== "SUCCEEDED") {
        const message = parseFailureMessage(response.cause);

        if (message === ACTIVE_SESSION_MESSAGE) {
            throw new ConflictError(message);
        }

        throw new AppError("User data could not be deleted.");
    }

    if (!response.output) {
        throw new AppError("Delete-data workflow completed without output.");
    }

    const output = parseOutput(response.output);
    const message =
        typeof output.message === "string"
            ? output.message
            : "User data could not be deleted.";

    if (output.status === "BLOCKED") {
        throw new ConflictError(message);
    }

    if (output.status !== "DELETED") {
        throw new AppError("Delete-data workflow returned an unknown result.");
    }

    return { message };
}
