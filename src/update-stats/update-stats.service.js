import { docClient } from "../helpers/db-client.helper.js";
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

export const updateExerciseStats = async (
    userId,
    sortKey,
    stats,
    tableName,
) => {
    console.log(
        `Updating exercise stats for user: ${userId}, sortKey: ${sortKey} in ${tableName}`,
    );

    const updateParts = [];
    const expressionAttributeValues = {};

    updateParts.push("Best1RM = :best1RM");
    expressionAttributeValues[":best1RM"] = stats.Best1RM;

    updateParts.push("BestVolume = :bestVolume");
    expressionAttributeValues[":bestVolume"] = stats.BestVolume;

    updateParts.push("BestWeight = :bestWeight");
    expressionAttributeValues[":bestWeight"] = stats.BestWeight;

    updateParts.push("MaxReps = :maxReps");
    expressionAttributeValues[":maxReps"] = stats.MaxReps;

    await docClient.send(
        new UpdateCommand({
            TableName: tableName,
            Key: {
                UserId: userId,
                SK: sortKey,
            },
            UpdateExpression: `SET ${updateParts.join(", ")}`,
            ExpressionAttributeValues: expressionAttributeValues,
        }),
    );
};

export const updateGlobalStats = async (
    userId,
    totalVolume,
    totalReps,
    tableName,
) => {
    console.log(`Updating global stats for user: ${userId} in ${tableName}`);

    await docClient.send(
        new UpdateCommand({
            TableName: tableName,
            Key: {
                UserId: userId,
                SK: "STAT#TOTAL",
            },
            UpdateExpression:
                "ADD TotalWorkouts :inc, TotalVolume :volume, TotalReps :reps",
            ExpressionAttributeValues: {
                ":inc": 1,
                ":volume": totalVolume,
                ":reps": totalReps,
            },
        }),
    );
};
