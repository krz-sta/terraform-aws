import { SQSEvent } from "aws-lambda/trigger/sqs.js";
import {
    archiveWorkoutSnapshots,
    collectWorkoutSnapshots,
} from "./archive-workout.helper.js";

export const handler = async (event: SQSEvent) => {
    try {
        const snapshots = collectWorkoutSnapshots(event);
        await archiveWorkoutSnapshots(snapshots);
    } catch (error) {
        console.error("Error archiving workout snapshots:", error);
        throw error;
    }
};
