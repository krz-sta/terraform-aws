import { APIGatewayProxyEvent } from "aws-lambda";
import { BadRequestError } from "../helpers/error.helper.js";
import type { ParsedEvent } from "../types/events.js";

function parseBody(body: string | null | undefined): Record<string, unknown> {
    if (body !== null && body !== undefined) {
        let parsed: unknown;

        try {
            parsed = JSON.parse(body);
        } catch {
            throw new BadRequestError("Invalid JSON body.");
        }

        if (
            typeof parsed !== "object" ||
            parsed === null ||
            Array.isArray(parsed)
        ) {
            throw new BadRequestError("Invalid JSON body.");
        }

        return parsed as Record<string, unknown>;
    }
    throw new BadRequestError("Missing JSON body.");
}

export function parser() {
    return {
        before: (request: { event: APIGatewayProxyEvent }): void => {
            const parsedBody = parseBody(request.event.body);
            (request.event as ParsedEvent).input = parsedBody;
        },
    };
}
