import { JSONSchemaType } from "ajv";
import { GetStatsRequest } from "../types/requests.js";

export const getStatsSchema: JSONSchemaType<GetStatsRequest> = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
    },
    required: ["userId"],
    additionalProperties: false,
};
