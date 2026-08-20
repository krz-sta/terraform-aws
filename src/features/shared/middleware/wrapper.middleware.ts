import type { JSONSchemaType } from "ajv";
import type { APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import { errorHandler } from "./error.middleware.js";
import { logger } from "./logger.middleware.js";
import { tracer } from "./tracer.middleware.js";
import { parser } from "./parser.middleware.js";
import { validateRequest } from "./validation.middleware.js";
import { responseHandler } from "./response.middleware.js";
import type { ValidatedEvent } from "../types/events.js";

export function withValidatedRequest<T>(
    schema: JSONSchemaType<T>,
    handlerLogic: (event: ValidatedEvent<T>) => Promise<unknown>,
) {
    return middy<ValidatedEvent<T>, APIGatewayProxyResult>()
        .use(tracer())
        .use(logger())
        .use(validateRequest(schema))
        .use(responseHandler())
        .use(errorHandler())
        .handler(
            handlerLogic as (
                event: ValidatedEvent<T>,
            ) => Promise<APIGatewayProxyResult>,
        );
}

export function withValidatedBodyRequest<T>(
    schema: JSONSchemaType<T>,
    handlerLogic: (event: ValidatedEvent<T>) => Promise<unknown>,
) {
    return middy<ValidatedEvent<T>, APIGatewayProxyResult>()
        .use(tracer())
        .use(logger())
        .use(parser())
        .use(validateRequest(schema))
        .use(responseHandler())
        .use(errorHandler())
        .handler(
            handlerLogic as (
                event: ValidatedEvent<T>,
            ) => Promise<APIGatewayProxyResult>,
        );
}
