import { calculateSessionStats } from "./update-stats.helper.js";

export const handler = async (event) => {
    try {
        await calculateSessionStats(event);
    } catch (e) {
        console.error("Error processing SQS event:", e);
        throw e;
    }
};
