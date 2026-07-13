import { Ajv } from "ajv";
import { updateSetSchema } from "./update-set.schema.js";

const ajv = new (Ajv as any)();
const validate = ajv.compile(updateSetSchema);

describe("updateSetSchema", () => {
    const validRequest = {
        userId: "user-123",
        sessionId: "session-456",
        exerciseName: "bench_press",
        setIndex: 0,
        setData: { weight: 100, reps: 5 },
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

    it("rejects missing setData", () => {
        expect(validate({ ...validRequest, setData: undefined })).toBe(false);
    });

    it("rejects extra properties", () => {
        expect(validate({ ...validRequest, extra: true })).toBe(false);
    });
});
