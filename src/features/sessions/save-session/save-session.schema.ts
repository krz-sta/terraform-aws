import { JSONSchemaType } from "ajv";
import { SaveSessionRequest } from "../../shared/types/requests.js";

export const saveSessionSchema: JSONSchemaType<SaveSessionRequest> = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
        sessionId: { type: "string", minLength: 1 },
    },
    required: ["userId", "sessionId"],
    additionalProperties: false,
};
