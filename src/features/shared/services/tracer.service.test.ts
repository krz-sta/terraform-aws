import { describe, expect, it } from "@jest/globals";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { tracer } from "./tracer.service.js";

describe("tracer", () => {
    it("captures AWS SDK v3 clients without changing the client reference", () => {
        const client = new DynamoDBClient({});

        expect(tracer.captureAWSv3Client(client)).toBe(client);
    });

    it("accepts annotations and metadata", () => {
        expect(() => {
            tracer.putAnnotation("feature", true);
            tracer.putMetadata("payload", { ok: true });
        }).not.toThrow();
    });
});
