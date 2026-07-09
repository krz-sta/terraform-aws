import {
    saveWorkoutSnapshot,
    WorkoutSnapshot,
} from "./archive-workout.service.js";

function buildWorkoutArchiveKey(
    UserId: string,
    StartTime: string,
    SessionId: string,
) {
    const startDate = new Date(StartTime ?? Date.now());

    return `${UserId}/${startDate.getFullYear()}/${startDate.getMonth() + 1}/${startDate.getDate()}/${SessionId}.parquet`;
}

export async function archiveWorkoutSnapshots(workouts: WorkoutSnapshot[]) {
    for (const workout of workouts) {
        const fileKey = buildWorkoutArchiveKey(
            workout.UserId,
            workout.StartTime,
            workout.SessionId,
        );

        console.log("Saving workout snapshot to S3 with key:", fileKey);

        await saveWorkoutSnapshot(fileKey, workout);
    }
}
