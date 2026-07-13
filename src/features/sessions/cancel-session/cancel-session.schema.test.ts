import { Ajv } from "ajv";
import { cancelSessionSchema } from "./cancel-session.schema.js";

const ajv = new (Ajv as any)();
const validate = ajv.compile(cancelSessionSchema);

describe("cancelSessionSchema", () => {
    it("accepts a valid request", () => {
        expect(validate({ userId: "user-123", sessionId: "session-456" })).toBe(
            true,
        );
    });

    it("rejects a missing userId", () => {
        expect(validate({ sessionId: "session-456" })).toBe(false);
    });

    it("rejects an empty userId", () => {
        expect(validate({ userId: "", sessionId: "session-456" })).toBe(false);
    });

    it("rejects a missing sessionId", () => {
        expect(validate({ userId: "user-123" })).toBe(false);
    });

    it("rejects extra properties", () => {
        expect(
            validate({
                userId: "user-123",
                sessionId: "session-456",
                extra: 1,
            }),
        ).toBe(false);
    });
});
