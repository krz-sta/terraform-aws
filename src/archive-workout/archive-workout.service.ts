import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

const s3 = new S3Client({});
const bucketName = process.env.WORKOUTS_ARCHIVE_BUCKET_NAME;

export const saveWorkoutSnapshot = async (fileKey: string, body: Buffer) => {
    await s3.send(
        new PutObjectCommand({
            Bucket: bucketName,
            Key: fileKey,
            Body: body,
            ContentType: "application/octet-stream",
        }),
    );
};
