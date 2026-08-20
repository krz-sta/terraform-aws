import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { tracer } from "../services/tracer.service.js";

const client = tracer.captureAWSv3Client(new DynamoDBClient({}));
export const docClient = DynamoDBDocumentClient.from(client);
