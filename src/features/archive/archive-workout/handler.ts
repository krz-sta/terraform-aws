import { SQSEvent } from "aws-lambda/trigger/sqs.js";
import {
    archiveWorkoutSnapshots,
    collectWorkoutSnapshots,
} from "./archive-workout.helper.js";
import { logger } from "../../shared/services/logger.service.js";

export const handler = async (event: SQSEvent) => {
    try {
        const snapshots = collectWorkoutSnapshots(event);
        await archiveWorkoutSnapshots(snapshots);
    } catch (error) {
        logger.error("Error archiving workout snapshots", error);
        throw error;
    }
};
