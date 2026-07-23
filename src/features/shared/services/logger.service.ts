type LogData = Record<string, unknown>;

type LogLevel = "info" | "warn" | "error";

function serializeError(error: Error): LogData {
    return {
        name: error.name,
        message: error.message,
        stack: error.stack,
    };
}

function normalizeData(data?: unknown): LogData | undefined {
    if (data === undefined) {
        return undefined;
    }

    if (data instanceof Error) {
        return { error: serializeError(data) };
    }

    if (typeof data === "object" && data !== null) {
        return data as LogData;
    }

    return { data };
}

export class Logger {
    private context: LogData;

    constructor(context: LogData = {}) {
        this.context = context;
    }

    setContext(context: LogData): void {
        this.context = context;
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

    private write(level: LogLevel, message: string, data?: unknown): void {
        const entry: LogData = {
            level,
            timestamp: new Date().toISOString(),
            message,
            ...this.context,
            ...normalizeData(data),
        };

        const line = JSON.stringify(entry);

        if (level === "error") {
            console.error(line);
        } else if (level === "warn") {
            console.warn(line);
        } else {
            console.log(line);
        }
    }
}

export const logger = new Logger();
