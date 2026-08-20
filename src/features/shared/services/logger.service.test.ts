import {
    beforeEach,
    afterEach,
    describe,
    expect,
    it,
    jest,
} from "@jest/globals";
import { logger } from "./logger.service.js";

type StdoutWriteSpy = {
    mock: {
        calls: Array<Parameters<typeof process.stdout.write>>;
    };
    mockRestore: () => void;
};

function readLogLine(spy: StdoutWriteSpy): Record<string, unknown> {
    const firstCall = spy.mock.calls[0]?.[0];

    if (typeof firstCall !== "string" && !Buffer.isBuffer(firstCall)) {
        throw new Error("Expected logger to write a JSON string.");
    }

    return JSON.parse(firstCall.toString()) as Record<string, unknown>;
}

describe("logger", () => {
    let logSpy: StdoutWriteSpy;

    beforeEach(() => {
        logSpy = jest
            .spyOn(process.stdout, "write")
            .mockImplementation(() => true) as unknown as StdoutWriteSpy;
    });

    afterEach(() => {
        logger.setContext({});
        logSpy.mockRestore();
    });

    it("writes structured logs with the current context", () => {
        logger.setContext({ requestId: "request-1", functionName: "handler" });

        logger.info("Request received", { path: "/status" });

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(readLogLine(logSpy)).toMatchObject({
            level: "INFO",
            message: "Request received",
            requestId: "request-1",
            functionName: "handler",
            path: "/status",
            service: "terraform-aws",
        });
    });

    it("replaces the previous context when a new one is set", () => {
        logger.setContext({ requestId: "first-request" });
        logger.setContext({ requestId: "second-request" });

        logger.info("Request completed");

        expect(logSpy).toHaveBeenCalledTimes(1);
        expect(readLogLine(logSpy)).toMatchObject({
            requestId: "second-request",
            message: "Request completed",
        });
        expect(readLogLine(logSpy)).not.toMatchObject({
            requestId: "first-request",
        });
    });
});
