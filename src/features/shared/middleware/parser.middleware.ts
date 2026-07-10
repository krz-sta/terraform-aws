import { APIGatewayProxyEvent } from "aws-lambda";
import { BadRequestError } from "../helpers/error.helper.js";

export type ParsedEvent = APIGatewayProxyEvent & {
    input?: Record<string, unknown>;
};

function createInput(body: string | null | undefined): Record<string, unknown> {
    if (body !== null && body != undefined) {
        try {
            return JSON.parse(body);
        } catch {
            throw new BadRequestError("Invalid JSON body.");
        }
    } else {
        throw new BadRequestError("No request body.");
    }
}

export function bodyParser() {
    return {
        before: function (request: { event: APIGatewayProxyEvent }): void {
            (request.event as ParsedEvent).input = createInput(
                request.event.body,
            );
        },
    };
}
