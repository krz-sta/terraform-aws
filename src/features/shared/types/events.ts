import type { AttributeValue } from "@aws-sdk/client-dynamodb";
import type { APIGatewayProxyEvent } from "aws-lambda";

export type DynamoDbStreamRecord = {
    dynamodb?: {
        NewImage?: Record<string, AttributeValue>;
    };
};

export type ParsedEvent = APIGatewayProxyEvent & {
    input?: Record<string, unknown>;
};

export type ValidatedEvent<T> = ParsedEvent & {
    validatedBody: T;
};
