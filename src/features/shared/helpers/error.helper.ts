export class AppError extends Error {
    public readonly statusCode: number;
    public readonly data?: { [key: string]: string };

    constructor(
        message: string,
        statusCode: number = 500,
        data?: { [key: string]: string },
    ) {
        super(message);
        this.statusCode = statusCode;
        this.data = data;
    }
}

export class BadRequestError extends AppError {
    constructor(
        message: string = "Bad Request.",
        data?: { [key: string]: string },
    ) {
        super(message, 400, data);
    }
}

export class NotFoundError extends AppError {
    constructor(
        message: string = "Not found.",
        data?: { [key: string]: string },
    ) {
        super(message, 404, data);
    }
}

export class ConflictError extends AppError {
    constructor(
        message: string = "Conflict.",
        data?: { [key: string]: string },
    ) {
        super(message, 409, data);
    }
}

export type ValidationErrorDetails = {
    validationErrors: Array<{
        property: string;
        message?: string;
    }>;
};

export class ValidationError extends BadRequestError {
    constructor(validationErrors: ValidationErrorDetails["validationErrors"]) {
        super("Schema validation failed.", {
            validationErrors: JSON.stringify(validationErrors),
        });
    }
}
