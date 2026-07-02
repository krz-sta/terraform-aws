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
        payload: any,
    ): APIGatewayProxyResult {
        return {
            statusCode: statusCode,
            body: JSON.stringify(payload),
        };
    },

    error: function (error: any): APIGatewayProxyResult {
        if (error instanceof AppError) {
            const responseBody: any = {
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

    parseBody: function (body?: string | null): unknown {
        if (!body) return null;

        try {
            return JSON.parse(body);
        } catch (e) {
            return null;
        }
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
            event.queryStringParameters
                ? (dataToValidate = event.queryStringParameters)
                : (dataToValidate = {});
        } else {
            const rawBody = event.body ? event.body : undefined;
            dataToValidate = Http.parseBody(rawBody);
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
