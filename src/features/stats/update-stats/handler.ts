import { SQSEvent } from "aws-lambda";
import {
    buildSessionsForStats,
    calculateSessionStats,
} from "./update-stats.helper.js";
import { logger } from "../../shared/services/logger.service.js";

export const handler = async (event: SQSEvent) => {
    try {
        const sessions = buildSessionsForStats(event);
        await calculateSessionStats(sessions);
    } catch (error) {
        logger.error("Error processing SQS event", error);
        throw error;
    }
};
