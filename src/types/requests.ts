export type AddExerciseRequest = {
    userId: string;
    sessionId: string;
    exerciseName: string;
};

export type AddSetRequest = {
    userId: string;
    sessionId: string;
    exerciseName: string;
    setData: {
        weight: number;
        reps: number;
    };
};

export type CancelSessionRequest = {
    userId: string;
    sessionId: string;
};

export type DeleteExerciseRequest = {
    userId: string;
    sessionId: string;
    exerciseName: string;
};

export type DeleteSetRequest = {
    userId: string;
    sessionId: string;
    exerciseName: string;
    setIndex: number;
};

export type GetSessionRequest = {
    userId: string;
    sessionId: string;
};

export type GetStatsRequest = {
    userId: string;
};

export type SaveSessionRequest = {
    userId: string;
    sessionId: string;
};

export type StartSessionRequest = {
    userId: string;
};

export type UpdateSetRequest = {
    userId: string;
    sessionId: string;
    exerciseName: string;
    setIndex: number;
    setData: {
        weight: number;
        reps: number;
    };
};
