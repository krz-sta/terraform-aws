import { handler } from "./handler.js";

describe("get-status handler", () => {
    it("returns 200 with status message", async () => {
        const response = await handler({} as any);

        expect(response.statusCode).toBe(200);
        expect(response.headers).toEqual({
            "Content-Type": "application/json",
        });
        expect(JSON.parse(response.body)).toEqual({ message: "Status OK." });
    });
});
