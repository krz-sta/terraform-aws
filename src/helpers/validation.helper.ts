import { Ajv, JSONSchemaType, ErrorObject } from "ajv";
const ajv = new Ajv();

interface ValidationError {
    property: string;
    message: string | undefined;
}

export const validateRequest = async <T>(
    schema: JSONSchemaType<T>,
    requestBody: unknown,
): Promise<ValidationError[] | null> => {
    const validate = ajv.compile(schema);
    const valid = validate(requestBody);
    if (!valid) {
        console.log(validate.errors);
        const errors: ErrorObject[] = validate.errors ?? [];
        return errors.map((err: ErrorObject) => ({
            property: err.instancePath,
            message: err.message,
        }));
    }
    return null;
};
