import { JSONSchemaType } from "ajv";

const { validateRequest } = await import("./validation.middleware.js");
const { ValidationError } = await import("../helpers/error.helper.js");

type TestBody = {
    userId: string;
    count: number;
};

const schema: JSONSchemaType<TestBody> = {
    type: "object",
    properties: {
        userId: { type: "string", minLength: 1 },
        count: { type: "number" },
    },
    required: ["userId", "count"],
    additionalProperties: false,
};

describe("validateRequest middleware", () => {
    const middleware = validateRequest(schema);

    it("sets validatedBody when input is valid", () => {
        const event = {
            queryStringParameters: null,
            input: { userId: "user-123", count: 5 },
            requestContext: {},
        } as any;

        middleware.before({ event });

        expect(event.validatedBody).toEqual({ userId: "user-123", count: 5 });
    });

    it("merges queryStringParameters with input", () => {
        const event = {
            queryStringParameters: { userId: "user-123" },
            input: { count: 5 },
            requestContext: {},
        } as any;

        middleware.before({ event });

        expect(event.validatedBody).toEqual({ userId: "user-123", count: 5 });
    });

    it("extracts userId from authorizer claims sub", () => {
        const event = {
            queryStringParameters: { count: 5 },
            input: {},
            requestContext: {
                authorizer: { claims: { sub: "user-123" } },
            },
        } as any;

        middleware.before({ event });

        expect(event.validatedBody).toEqual({ userId: "user-123", count: 5 });
    });

    it("extracts userId from authorizer claims username", () => {
        const event = {
            queryStringParameters: { count: 5 },
            input: {},
            requestContext: {
                authorizer: { claims: { username: "user-123" } },
            },
        } as any;

        middleware.before({ event });

        expect(event.validatedBody).toEqual({ userId: "user-123", count: 5 });
    });

    it("throws ValidationError when schema validation fails", () => {
        const event = {
            queryStringParameters: null,
            input: { userId: "" },
            requestContext: {},
        } as any;

        expect(() => middleware.before({ event })).toThrow(ValidationError);
    });
});
