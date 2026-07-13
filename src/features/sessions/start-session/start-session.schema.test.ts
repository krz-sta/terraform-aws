import { Ajv } from "ajv";
import { startSessionSchema } from "./start-session.schema.js";

const ajv = new (Ajv as any)();
const validate = ajv.compile(startSessionSchema);

describe("startSessionSchema", () => {
    it("accepts a valid request", () => {
        expect(validate({ userId: "user-123" })).toBe(true);
    });

    it("rejects a missing userId", () => {
        expect(validate({})).toBe(false);
    });

    it("rejects an empty userId", () => {
        expect(validate({ userId: "" })).toBe(false);
    });

    it("rejects a non-string userId", () => {
        expect(validate({ userId: 123 })).toBe(false);
    });

    it("rejects extra properties", () => {
        expect(validate({ userId: "user-123", extra: true })).toBe(false);
    });
});
