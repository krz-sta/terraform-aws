import { Logger as PowertoolsLogger } from "@aws-lambda-powertools/logger";

type LogData = Record<string, unknown>;

export class Logger {
    private readonly logger: PowertoolsLogger;

    constructor(context: LogData = {}) {
        this.logger = new PowertoolsLogger({ serviceName: "terraform-aws" });
        this.setContext(context);
    }

    setContext(context: LogData): void {
        this.logger.resetKeys();
        this.logger.appendKeys(context);
    }

    info(message: string, data?: unknown): void {
        this.write("info", message, data);
    }

    warn(message: string, data?: unknown): void {
        this.write("warn", message, data);
    }

    error(message: string, data?: unknown): void {
        this.write("error", message, data);
    }

    private write(
        logType: "info" | "warn" | "error",
        message: string,
        data?: unknown,
    ): void {
        const payload = this.normalizeData(data);

        if (logType === "error") {
            this.logger.error(message, ...(payload ? [payload] : []));
            return;
        }

        if (logType === "warn") {
            this.logger.warn(message, ...(payload ? [payload] : []));
            return;
        }

        this.logger.info(message, ...(payload ? [payload] : []));
    }

    private normalizeData(data?: unknown): LogData | undefined {
        if (data === undefined) {
            return undefined;
        }

        if (data instanceof Error) {
            return {
                error: {
                    name: data.name,
                    message: data.message,
                    stack: data.stack,
                },
            };
        }

        if (typeof data === "object" && data !== null) {
            return data as LogData;
        }

        return { data };
    }
}

export const logger = new Logger();
