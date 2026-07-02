export class AppError extends Error {
    public readonly statusCode: number;
    public readonly data?: string;

    constructor(message: string, statusCode: number = 500, data?: string) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }
}

export class BadRequestError extends AppError {
    constructor(message: string = "Bad Request.", data?: string) {
        super(message, 400, data);
    }
}

export class NotFoundError extends AppError {
    constructor(message: string = "Not found.", data?: string) {
        super(message, 404, data);
    }
}

export class ConflictError extends AppError {
    constructor(message: string = "Conflict.", data?: string) {
        super(message, 409, data);
    }
}
