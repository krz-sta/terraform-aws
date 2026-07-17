import { jest } from "@jest/globals";

const { errorHandler } = await import("./error.middleware.js");
const { BadRequestError, NotFoundError } =
    await import("../helpers/error.helper.js");

describe("errorHandler middleware", () => {
    const middleware = errorHandler();

    it("maps AppError to the configured status code and message", () => {
        const request: any = { error: new NotFoundError("Missing.") };

        middleware.onError(request);

        expect(request.response).toEqual({
            statusCode: 404,
            body: JSON.stringify({ message: "Missing." }),
        });
    });

    it("includes AppError data in the response body", () => {
        const request: any = {
            error: new BadRequestError("Bad.", { field: "required" }),
        };

        middleware.onError(request);

        expect(request.response).toEqual({
            statusCode: 400,
            body: JSON.stringify({
                message: "Bad.",
                details: { field: "required" },
            }),
        });
    });

    it("maps unknown errors to 500", () => {
        const consoleSpy = jest
            .spyOn(console, "error")
            .mockImplementation(() => {});
        const request: any = { error: new Error("someerror") };

        middleware.onError(request);

        expect(request.response).toEqual({
            statusCode: 500,
            body: JSON.stringify({ message: "Unhandled server error." }),
        });
        consoleSpy.mockRestore();
    });
});
