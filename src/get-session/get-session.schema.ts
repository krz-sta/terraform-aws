import { JSONSchemaType } from "ajv";
import { GetSessionRequest } from "../types/requests.js";

export const getSessionSchema: JSONSchemaType<GetSessionRequest> = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
        sessionId: { type: "string", minLength: 1 },
    },
    required: ["userId", "sessionId"],
    additionalProperties: false,
};
