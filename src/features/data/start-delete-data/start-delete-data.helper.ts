import {
    SFNClient,
    StartExecutionCommand,
    DescribeExecutionCommand,
} from "@aws-sdk/client-sfn";
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
const MAX_WAIT_MS = 50_000;
const POLL_INTERVAL_MS = 500;
const ACTIVE_SESSION_MESSAGE =
    "Data cannot be deleted while an active session exists.";
const DELETE_FAILED_MESSAGE = "User data could not be deleted.";

function parseOutput(output: string): DeleteDataWorkflowOutput {
    try {
        return JSON.parse(output) as DeleteDataWorkflowOutput;
    } catch {
        throw new AppError("Delete-data workflow returned invalid output.");
    }
}

function parseFailureMessage(cause: string | undefined): string {
    if (!cause) {
        return DELETE_FAILED_MESSAGE;
    }

    try {
        const parsed = JSON.parse(cause) as DeleteDataWorkflowFailure;

        if (typeof parsed.errorMessage === "string") {
            return parsed.errorMessage;
        }

        return typeof parsed.message === "string"
            ? parsed.message
            : DELETE_FAILED_MESSAGE;
    } catch {
        return cause;
    }
}

export async function startDeleteDataWorkflow(userId: string) {
    const startResp = await sfnClient.send(
        new StartExecutionCommand({
            stateMachineArn: DELETE_DATA_STATE_MACHINE_ARN,
            input: JSON.stringify({ userId }),
        }),
    );

    const { executionArn } = startResp;
    if (!executionArn) {
        throw new AppError("Could not start delete-data workflow.");
    }

    const deadline = Date.now() + MAX_WAIT_MS;
    while (Date.now() < deadline) {
        const desc = await sfnClient.send(
            new DescribeExecutionCommand({ executionArn }),
        );

        const { status, output, cause } = desc;

        switch (status) {
            case "SUCCEEDED": {
                if (!output) {
                    throw new AppError(
                        "Delete-data workflow completed without output.",
                    );
                }

                const parsedOutput = parseOutput(output);
                if (parsedOutput.status !== "DELETED") {
                    throw new AppError(
                        "Delete-data workflow returned an unknown result.",
                    );
                }

                return {
                    message:
                        typeof parsedOutput.message === "string"
                            ? parsedOutput.message
                            : DELETE_FAILED_MESSAGE,
                };
            }
            case "FAILED":
            case "TIMED_OUT":
            case "ABORTED": {
                const message = parseFailureMessage(cause);

                if (message === ACTIVE_SESSION_MESSAGE) {
                    throw new ConflictError(message);
                }

                throw new AppError(DELETE_FAILED_MESSAGE);
            }
            default:
                await new Promise((resolve) =>
                    setTimeout(resolve, POLL_INTERVAL_MS),
                );
        }
    }

    throw new AppError("Timed out waiting for delete-data workflow to finish.");
}
