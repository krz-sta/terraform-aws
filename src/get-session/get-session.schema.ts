import { JSONSchemaType } from "ajv";

export interface GetSessionRequest {
    userId: string;
    sessionId: string;
}

export const getSessionSchema: JSONSchemaType<GetSessionRequest> = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
        sessionId: { type: "string", minLength: 1 },
    },
    required: ["userId", "sessionId"],
    additionalProperties: false,
};
