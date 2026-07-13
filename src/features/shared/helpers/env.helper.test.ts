import { requireEnv } from "./env.helper.js";

describe("requireEnv", () => {
    const ENV = process.env;

    beforeEach(() => {
        process.env = { ...ENV };
    });

    afterAll(() => {
        process.env = ENV;
    });

    it("returns the value when the environment variable is set", () => {
        process.env.TEST_VAR = "test-value";
        expect(requireEnv("TEST_VAR")).toBe("test-value");
    });

    it("throws when the environment variable is missing", () => {
        delete process.env.MISSING_VAR;
        expect(() => requireEnv("MISSING_VAR")).toThrow(
            "Missing environment variable: MISSING_VAR",
        );
    });
});
