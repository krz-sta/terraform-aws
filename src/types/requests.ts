import { SetInput } from "./workout.js";

type UserScoped = {
    userId: string;
};

type SessionScoped = UserScoped & {
    sessionId: string;
};

type ExerciseScoped = SessionScoped & {
    exerciseName: string;
};

export type AddExerciseRequest = {
    userId: string;
    sessionId: string;
    exerciseName: string;
};

export type AddSetRequest = ExerciseScoped & {
    setData: SetInput;
};

export type CancelSessionRequest = SessionScoped;

export type DeleteExerciseRequest = ExerciseScoped;

export type DeleteSetRequest = ExerciseScoped & {
    setIndex: number;
};

export type GetSessionRequest = SessionScoped;

export type GetStatsRequest = UserScoped;

export type SaveSessionRequest = SessionScoped;

export type StartSessionRequest = UserScoped;

export type UpdateSetRequest = ExerciseScoped & {
    setIndex: number;
    setData: SetInput;
};
