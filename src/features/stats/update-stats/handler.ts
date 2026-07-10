import { SQSEvent } from "aws-lambda";
import {
    buildSessionsForStats,
    calculateSessionStats,
} from "./update-stats.helper.js";

export const handler = async (event: SQSEvent) => {
    try {
        const sessions = buildSessionsForStats(event);
        await calculateSessionStats(sessions);
    } catch (error) {
        console.error("Error processing SQS event:", error);
        throw error;
    }
};
