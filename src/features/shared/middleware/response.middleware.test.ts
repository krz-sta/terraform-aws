const { responseHandler } = await import("./response.middleware.js");

describe("responseHandler middleware", () => {
    const middleware = responseHandler();

    it("passes through API Gateway responses unchanged", () => {
        const response = {
            statusCode: 201,
            body: JSON.stringify({ ok: true }),
        };
        const request: any = { response };

        middleware.after(request);

        expect(request.response).toEqual(response);
    });

    it("wraps plain payloads in a JSON success response", () => {
        const request: any = { response: { sessionId: "abc123" } };

        middleware.after(request);

        expect(request.response).toEqual({
            statusCode: 200,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ sessionId: "abc123" }),
        });
    });

    it("uses an explicit statusCode from the payload", () => {
        const request: any = {
            response: { statusCode: 201, message: "Created" },
        };

        middleware.after(request);

        expect(request.response).toEqual({
            statusCode: 201,
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ message: "Created" }),
        });
    });
});
