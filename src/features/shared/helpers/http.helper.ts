import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { Ajv, ErrorObject, JSONSchemaType } from "ajv";
import { AppError } from "./error.helper.js";

const ajv = new Ajv();

export type ParsedRequest<T> =
    | { errorResponse: APIGatewayProxyResult; data?: never }
    | { errorResponse?: never; data: T };

export const Http = {
    success: function (
        statusCode: number,
        payload: unknown,
    ): APIGatewayProxyResult {
        return {
            statusCode: statusCode,
            body: JSON.stringify(payload),
        };
    },

    error: function (error: unknown): APIGatewayProxyResult {
        if (error instanceof AppError) {
            const responseBody: { message: string; details?: unknown } = {
                message: error.message,
            };

            if (error.data !== undefined) responseBody.details = error.data;

            return {
                statusCode: error.statusCode,
                body: JSON.stringify(responseBody),
            };
        }

        console.error("Unhandled error:", error);

        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Unhandled server error.",
            }),
        };
    },

    validate: async function <T>(
        schema: JSONSchemaType<T>,
        data: unknown,
    ): Promise<ErrorObject[] | null> {
        const validate = ajv.compile(schema);
        const isValid = validate(data);

        if (!isValid) {
            if (validate.errors) return validate.errors;
        }

        return null;
    },

    parseAndValidate: async function <T>(
        event: APIGatewayProxyEvent,
        schema: JSONSchemaType<T>,
    ): Promise<ParsedRequest<T>> {
        let dataToValidate: unknown;

        const hasBody =
            event.httpMethod === "GET" ||
            (!event.body && event.queryStringParameters);

        if (hasBody) {
            dataToValidate = event.queryStringParameters
                ? { ...event.queryStringParameters }
                : {};
        } else {
            dataToValidate = event.body as unknown;
        }

        const cognitoUserId =
            event.requestContext?.authorizer?.claims?.sub ||
            event.requestContext?.authorizer?.claims?.username;
        if (
            dataToValidate &&
            typeof dataToValidate === "object" &&
            cognitoUserId
        ) {
            dataToValidate = {
                ...(dataToValidate as Record<string, unknown>),
                userId: cognitoUserId,
            };
        }

        const validationErrors = await Http.validate(schema, dataToValidate);

        if (validationErrors) {
            const errorResponseBody = {
                message: "Schema validation failed.",
                validationErrors: validationErrors.map((err) => ({
                    property: err.instancePath,
                    message: err.message,
                })),
            };

            return {
                errorResponse: {
                    statusCode: 400,
                    body: JSON.stringify(errorResponseBody),
                },
            };
        }

        return {
            data: dataToValidate as T,
        };
    },
};
