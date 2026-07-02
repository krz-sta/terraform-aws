import { JSONSchemaType } from "ajv";

export interface SaveSessionRequest {
    userId: string;
    sessionId: string;
}

export const saveSessionSchema: JSONSchemaType<SaveSessionRequest> = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
        sessionId: { type: "string", minLength: 1 },
    },
    required: ["userId", "sessionId"],
    additionalProperties: false,
};
