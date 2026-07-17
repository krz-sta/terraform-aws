import type { JSONSchemaType } from "ajv";
import type { APIGatewayProxyResult } from "aws-lambda";
import middy from "@middy/core";
import { errorHandler } from "./error.middleware.js";
import { logger } from "./logger.middleware.js";
import { parser } from "./parser.middleware.js";
import { validateRequest } from "./validation.middleware.js";
import type { ValidatedEvent } from "../types/events.js";

type ApiHandlerLogic<T> = (
    event: ValidatedEvent<T>,
) => Promise<APIGatewayProxyResult>;

export function withValidatedRequest<T>(
    schema: JSONSchemaType<T>,
    handlerLogic: ApiHandlerLogic<T>,
) {
    return middy<ValidatedEvent<T>, APIGatewayProxyResult>()
        .use(logger())
        .use(validateRequest(schema))
        .use(errorHandler())
        .handler(handlerLogic);
}

export function withValidatedBodyRequest<T>(
    schema: JSONSchemaType<T>,
    handlerLogic: ApiHandlerLogic<T>,
) {
    return middy<ValidatedEvent<T>, APIGatewayProxyResult>()
        .use(logger())
        .use(parser())
        .use(validateRequest(schema))
        .use(errorHandler())
        .handler(handlerLogic);
}
