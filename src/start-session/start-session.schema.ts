import { JSONSchemaType } from "ajv";

export interface StartSessionRequest {
    userId: string;
}

export const startSessionSchema: JSONSchemaType<StartSessionRequest> = {
    type: "object",
    properties: {
        userId: {
            type: "string",
            minLength: 1,
        },
    },
    required: ["userId"],
    additionalProperties: false,
};
