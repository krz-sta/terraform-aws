import { calculateSessionStats } from "./update-stats.helper.js";

export const handler = async (event: any) => {
    try {
        await calculateSessionStats(event);
    } catch (e: any) {
        console.error("Error processing SQS event:", e);
        throw e;
    }
};
