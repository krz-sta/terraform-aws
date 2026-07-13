import { Ajv } from "ajv";
import { addExerciseSchema } from "./add-exercise.schema.js";

const ajv = new (Ajv as any)();
const validate = ajv.compile(addExerciseSchema);

describe("addExerciseSchema", () => {
    it("accepts a valid request", () => {
        expect(
            validate({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
            }),
        ).toBe(true);
    });

    it("rejects a missing userId", () => {
        expect(
            validate({ sessionId: "session-456", exerciseName: "bench_press" }),
        ).toBe(false);
    });

    it("rejects an empty exerciseName", () => {
        expect(
            validate({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "",
            }),
        ).toBe(false);
    });

    it("rejects extra properties", () => {
        expect(
            validate({
                userId: "user-123",
                sessionId: "session-456",
                exerciseName: "bench_press",
                extra: true,
            }),
        ).toBe(false);
    });
});
