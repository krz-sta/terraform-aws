import { JSONSchemaType } from "ajv";
import { CancelSessionRequest } from "../types/requests.js";

export const cancelSessionSchema: JSONSchemaType<CancelSessionRequest> = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
        sessionId: { type: "string", minLength: 1 },
    },
    required: ["userId", "sessionId"],
    additionalProperties: false,
};
