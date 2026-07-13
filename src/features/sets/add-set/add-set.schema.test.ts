import Ajv from "ajv";
import { addSetSchema } from "./add-set.schema.js";

const ajv = new (Ajv as any)();
const validate = ajv.compile(addSetSchema);

describe("addSetSchema", () => {
    const validRequest = {
        userId: "user-123",
        sessionId: "session-456",
        exerciseName: "bench_press",
        setData: { weight: 100, reps: 5 },
    };

    it("accepts a valid request", () => {
        expect(validate(validRequest)).toBe(true);
    });

    it("rejects a missing exerciseName", () => {
        expect(validate({ ...validRequest, exerciseName: undefined })).toBe(
            false,
        );
    });

    it("rejects negative weight", () => {
        expect(
            validate({ ...validRequest, setData: { weight: -1, reps: 5 } }),
        ).toBe(false);
    });

    it("rejects negative reps", () => {
        expect(
            validate({ ...validRequest, setData: { weight: 100, reps: -1 } }),
        ).toBe(false);
    });

    it("rejects extra properties", () => {
        expect(validate({ ...validRequest, extra: true })).toBe(false);
    });

    it("rejects extra properties inside setData", () => {
        expect(
            validate({
                ...validRequest,
                setData: { weight: 100, reps: 5, extra: true },
            }),
        ).toBe(false);
    });
});
