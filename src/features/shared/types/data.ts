export type DeleteDataWorkflowInput = {
    userId?: string;
};

export type CheckActiveSessionResult = {
    userId: string;
    hasActiveSession: boolean;
};

export type DeleteUserDataResult = {
    userId: string;
    deleted: {
        sessionHistory: number;
        userStats: number;
        archiveObjects: number;
    };
};

export type DeleteDataWorkflowOutput = {
    status?: unknown;
    message?: unknown;
};

export type DeleteDataWorkflowFailure = {
    errorMessage?: unknown;
    message?: unknown;
};
