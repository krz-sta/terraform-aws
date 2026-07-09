export type SetData = {
    weight: number;
    Weight?: number;
    reps: number;
    Reps?: number;
};

export type SetInput = Pick<SetData, "weight" | "reps">;

export type ExerciseEntry = {
    Sets: SetData[];
};

export type ExercisesMap = Record<string, ExerciseEntry>;

export type ActiveSessionItem = {
    UserId: string;
    SessionId: string;
    Exercises?: ExercisesMap;
    StartTime?: string;
    EndTime?: string;
    TimeToExist?: number;
};

export type SessionHistoryItem = {
    UserId: string;
    SessionId: string;
    Exercises: ExercisesMap;
    StartTime?: string;
    EndTime: string;
    TimeToExist: number;
};

export type UserStatItem = {
    UserId: string;
    SK: string;
} & Record<string, unknown>;
