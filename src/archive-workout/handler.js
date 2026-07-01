import { archiveWorkoutSnapshots } from "./archive-workout.helper.js";

export const handler = async (event) => {
    try {
        await archiveWorkoutSnapshots(event);
    } catch (e) {
        console.error("Error archiving workout snapshots:", e);
        throw e;
    }
};
