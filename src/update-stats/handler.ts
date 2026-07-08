import { AttributeValue } from "@aws-sdk/client-dynamodb";
import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SQSEvent } from "aws-lambda";
import { calculateSessionStats } from "./update-stats.helper.js";

const parseDbRecords = (event: SQSEvent): any[] => {
    const dbRecords = [];

    for (const record of event.Records ?? []) {
        const sqsBody = JSON.parse(record.body);
        const message =
            typeof sqsBody.Message === "string"
                ? JSON.parse(sqsBody.Message)
                : sqsBody.Message;
        const records = Array.isArray(message?.Records)
            ? message.Records
            : message
              ? [message]
              : [];

        dbRecords.push(...records);
    }

    return dbRecords;
};

const buildSessionsForStats = (event: SQSEvent) => {
    const sessions = [];

    for (const dbRecord of parseDbRecords(event)) {
        const newImage = dbRecord?.dynamodb?.NewImage;
        if (!newImage) {
            continue;
        }

        const sessionData = unmarshall(
            newImage as Record<string, AttributeValue>,
        );
        if (!sessionData?.UserId || !sessionData?.Exercises) {
            continue;
        }

        sessions.push({
            userId: sessionData.UserId,
            exercises: sessionData.Exercises,
        });
    }

    return sessions;
};

export const handler = async (event: SQSEvent) => {
    try {
        const sessions = buildSessionsForStats(event);
        await calculateSessionStats(sessions);
    } catch (e) {
        console.error("Error processing SQS event:", e);
        throw e;
    }
};
