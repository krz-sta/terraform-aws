import Ajv from "ajv";
const ajv = new Ajv();

export const validateRequest = async (schema, requestBody) => {
    const validate = ajv.compile(schema);
    const valid = validate(requestBody);
    if (!valid) {
        console.log(validate.errors);
        return validate.errors.map((err) => ({
            property: err.instancePath,
            message: err.message,
        }));
    }
    return null;
};
