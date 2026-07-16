export type ValidationErrorDetails = {
    validationErrors: Array<{
        property: string;
        message?: string;
    }>;
};
