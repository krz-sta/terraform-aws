import { JSONSchemaType } from "ajv";
import { StartDeleteDataRequest } from "../../shared/types/requests.js";

export const startDeleteDataSchema: JSONSchemaType<StartDeleteDataRequest> = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
    },
    required: ["userId"],
    additionalProperties: false,
};
