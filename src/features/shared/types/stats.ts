import type { ExercisesMap, SetData } from "./workout.js";

export type ParsedSessionData = {
    UserId: string;
    Exercises: ExercisesMap;
};

export type SetLike = Partial<SetData> & {
    Weight?: number;
    Reps?: number;
};

export type ExerciseData = {
    Sets?: SetLike[];
    sets?: SetLike[];
};

export type SessionStatsInput = {
    userId: string;
    exercises: Record<string, ExerciseData>;
};
