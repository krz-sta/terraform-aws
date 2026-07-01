import { queryNoSk } from "../services/db-client.service.js";

const USER_STATS_TABLE_NAME = process.env.USER_STATS_TABLE_NAME;

export const getStatsLogic = async (userId) => {
    console.log(
        `Querying stats for userId: ${userId} from table: ${USER_STATS_TABLE_NAME}`,
    );
    const stats = await queryNoSk("UserId", userId, USER_STATS_TABLE_NAME);

    const result = {
        total: {},
        exercises: {},
    };

    for (const stat of stats) {
        if (stat.SK === "STAT#TOTAL") {
            result.total = stat;
            delete stat.SK;
            delete stat.UserId;
        } else if (stat.SK.startsWith("EX#")) {
            const exerciseName = stat.SK.replace("EX#", "");
            result.exercises[exerciseName] = stat;
            delete stat.SK;
            delete stat.UserId;
        }
    }

    return result;
};
