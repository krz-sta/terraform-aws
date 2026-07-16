export function workflowLogger(taskName: string) {
    return {
        before: (): void => {
            console.log("WORKFLOW_TASK_STARTED", { taskName });
        },
        after: (): void => {
            console.log("WORKFLOW_TASK_COMPLETED", { taskName });
        },
        onError: (request: { error: unknown }): void => {
            console.error("WORKFLOW_TASK_FAILED", {
                taskName,
                error: request.error,
            });
        },
    };
}
