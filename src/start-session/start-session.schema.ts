import { JSONSchemaType } from "ajv";
import { StartSessionRequest } from "../types/requests.js";

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
