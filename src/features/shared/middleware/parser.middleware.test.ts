const { parser } = await import("./parser.middleware.js");
const { BadRequestError } = await import("../helpers/error.helper.js");

describe("parser middleware", () => {
    const middleware = parser();

    it("parses a valid JSON body into event.input", () => {
        const event = { body: '{"key":"value"}' } as any;

        middleware.before({ event });

        expect(event.input).toEqual({ key: "value" });
    });

    it("throws BadRequestError when body is missing", () => {
        expect(() =>
            middleware.before({ event: { body: null } as any }),
        ).toThrow(BadRequestError);
    });

    it("throws BadRequestError for invalid JSON", () => {
        expect(() =>
            middleware.before({ event: { body: "not-json" } as any }),
        ).toThrow(BadRequestError);
    });

    it("throws BadRequestError when body is an array", () => {
        expect(() =>
            middleware.before({ event: { body: "[1,2,3]" } as any }),
        ).toThrow(BadRequestError);
    });
});
