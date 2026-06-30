import { docClient } from "./src/helpers/db-client.helper.js";
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

const startTime = new Date();
startTime.setMinutes(startTime.getMinutes() - 30);

const sessionHistoryItem = {
    UserId: "test-user-id",
    SessionId: crypto.randomUUID(),
    Exercises: {
        "barbell-bench-press": {
            sets: [
                { weight: 100, reps: 10 },
                { weight: 125, reps: 8 },
                { weight: 120, reps: 6 },
            ],
        },
        "dumbbell-curl": {
            sets: [
                { weight: 20, reps: 12 },
                { weight: 25, reps: 10 },
                { weight: 30, reps: 8 },
            ],
        },
        "pull-up": {
            sets: [
                { weight: 0, reps: 10 },
                { weight: 0, reps: 8 },
                { weight: 0, reps: 6 },
            ],
        },
    },
    StartTime: startTime.toISOString(),
    EndTime: new Date().toISOString(),
    TimeToExist: Math.floor(Date.now() / 1000) + 30 * 24 * 3600,
};

try {
    await docClient.send(
        new PutCommand({
            TableName: "DBSessionHistory",
            Item: sessionHistoryItem,
        }),
    );
    console.log("Test session saved successfully.");
} catch (e) {
    console.error("Error saving test session:", e);
}
