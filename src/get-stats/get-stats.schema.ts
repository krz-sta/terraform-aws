import { JSONSchemaType } from "ajv";

export interface GetStatsRequest {
    userId: string;
}

export const getStatsSchema: JSONSchemaType<GetStatsRequest> = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
    },
    required: ["userId"],
    additionalProperties: false,
};
