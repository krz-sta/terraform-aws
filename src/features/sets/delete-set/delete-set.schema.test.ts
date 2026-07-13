import { Ajv } from "ajv";
import { deleteSetSchema } from "./delete-set.schema.js";

const ajv = new (Ajv as any)();
const validate = ajv.compile(deleteSetSchema);

describe("deleteSetSchema", () => {
    const validRequest = {
        userId: "user-123",
        sessionId: "session-456",
        exerciseName: "bench_press",
        setIndex: 0,
    };

    it("accepts a valid request", () => {
        expect(validate(validRequest)).toBe(true);
    });

    it("rejects a negative setIndex", () => {
        expect(validate({ ...validRequest, setIndex: -1 })).toBe(false);
    });

    it("rejects a non-numeric setIndex", () => {
        expect(validate({ ...validRequest, setIndex: "0" })).toBe(false);
    });

    it("rejects a missing exerciseName", () => {
        expect(validate({ ...validRequest, exerciseName: undefined })).toBe(
            false,
        );
    });

    it("rejects extra properties", () => {
        expect(validate({ ...validRequest, extra: true })).toBe(false);
    });
});
