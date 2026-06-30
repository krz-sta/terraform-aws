import { unmarshall } from "@aws-sdk/util-dynamodb";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({});

console.log("Loading function");

export const handler = async (event) => {
    for (const record of event.Records) {
        const payload = unmarshall(record.dynamodb.NewImage);
        const { UserId, SessionId, StartTime, EndTime, Exercises } = payload;
        const start = new Date(StartTime);
        const end = new Date(EndTime);
        const duration = (end - start) / 60000;
        const fileKey = `${UserId}/${start.getFullYear()}/${start.getMonth() + 1}/${start.getDate()}/${SessionId}.json`;

        const item = {
            UserId,
            SessionId,
            Duration: duration,
            Exercises,
        };

        for (const exercise in Exercises) {
            let bestVolume = 0;
            let best1RM = 0;
            let bestWeight = 0;

            for (const set of Exercises[exercise].sets) {
                if (set.weight > bestWeight) {
                    bestWeight = set.weight;
                }
                const volume = set.weight * set.reps;
                if (volume > bestVolume) {
                    bestVolume = volume;
                }
                const oneRM = set.weight * (1 + set.reps / 30);
                if (oneRM > best1RM) {
                    best1RM = oneRM;
                }
                item.Exercises[exercise].BestVolume = bestVolume;
                item.Exercises[exercise].Best1RM = best1RM;
                item.Exercises[exercise].BestWeight = bestWeight;
            }
        }

        console.log("Processed item:", item);
        console.log("Saving to S3 with key:", fileKey);

        await s3.send(
            new PutObjectCommand({
                Bucket: "s3-workouts-archive20260629090340603800000001",
                Key: fileKey,
                Body: JSON.stringify(item, null, 2),
                ContentType: "application/json",
            }),
        );
    }
    return `Successfully processed ${event.Records.length} records.`;
};
