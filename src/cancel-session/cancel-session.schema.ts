import { JSONSchemaType } from "ajv";

export interface CancelSessionRequest {
    userId: string;
    sessionId: string;
}

export const cancelSessionSchema: JSONSchemaType<CancelSessionRequest> = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
        sessionId: { type: "string", minLength: 1 },
    },
    required: ["userId", "sessionId"],
    additionalProperties: false,
};
