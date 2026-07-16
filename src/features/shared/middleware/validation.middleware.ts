import { APIGatewayProxyEvent } from "aws-lambda";
import { Ajv, JSONSchemaType } from "ajv";
import { ValidationError } from "../helpers/error.helper.js";
import type { ParsedEvent, ValidatedEvent } from "../types/events.js";

const ajv = new Ajv();

export function validateRequest<T>(schema: JSONSchemaType<T>) {
    return {
        before: (request: { event: APIGatewayProxyEvent }): void => {
            const dataToValidate = collectDataToValidate(
                request.event as ParsedEvent,
            );
            const validate = ajv.compile(schema);
            const isValid = validate(dataToValidate);

            if (!isValid) {
                throw new ValidationError(
                    validate.errors!.map((err) => ({
                        property: err.instancePath,
                        message: err.message,
                    })),
                );
            }

            (request.event as ValidatedEvent<T>).validatedBody =
                dataToValidate as T;
        },
    };
}

function collectDataToValidate(event: ParsedEvent): Record<string, unknown> {
    const payload = extractPayload(event);
    const userId = extractUserId(event);

    return userId ? { ...payload, userId } : payload;
}

function extractPayload(event: ParsedEvent): Record<string, unknown> {
    return {
        ...(event.queryStringParameters || {}),
        ...(event.input || {}),
    };
}

function extractUserId(event: ParsedEvent): string | undefined {
    const claims = event.requestContext?.authorizer?.claims;
    return claims?.sub || claims?.username;
}
