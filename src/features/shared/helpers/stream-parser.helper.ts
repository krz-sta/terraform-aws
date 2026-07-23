import { SQSRecord } from "aws-lambda";
import type { DynamoDbStreamRecord } from "../types/events.js";

export function parseJson(value: string): unknown {
    try {
        return JSON.parse(value);
    } catch {
        return null;
    }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
    return value !== null && typeof value === "object";
}

function hasRecordsProperty(
    value: Record<string, unknown>,
): value is { Records: unknown[] } {
    return "Records" in value && Array.isArray(value.Records);
}

function isDynamoDbRecord(value: unknown): value is DynamoDbStreamRecord {
    if (!isRecord(value)) return false;
    if (!("dynamodb" in value)) return true;

    const dynamodb = value.dynamodb;
    if (!isRecord(dynamodb)) return false;
    if (!("NewImage" in dynamodb)) return true;

    return isRecord(dynamodb.NewImage);
}

function getDbRecords(payload: unknown): DynamoDbStreamRecord[] {
    if (!isRecord(payload)) return [];

    if (hasRecordsProperty(payload)) {
        return payload.Records.filter(isDynamoDbRecord);
    }

    return isDynamoDbRecord(payload) ? [payload] : [];
}

function unwrapSnsMessage(sqsBody: unknown): unknown {
    if (!isRecord(sqsBody) || !("Message" in sqsBody)) {
        return sqsBody;
    }

    const nestedMessage = sqsBody.Message;
    return typeof nestedMessage === "string"
        ? parseJson(nestedMessage)
        : nestedMessage;
}

export function parseDbRecordsFromSqs(
    record: SQSRecord,
): DynamoDbStreamRecord[] {
    const sqsBody = parseJson(record.body);
    const message = unwrapSnsMessage(sqsBody);
    return getDbRecords(message);
}
