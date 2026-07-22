import { handler } from "./handler.js";
import { makeTestUserId } from "../../../test-utils/aws.js";

const invoke = (event: any): any => handler(event, {} as any, undefined as any);

describe("delete-user-data handler", () => {
    it("returns the deletion result", async () => {
        const userId = makeTestUserId();

        await expect(invoke({ userId })).resolves.toEqual({
            userId,
            deleted: {
                sessionHistory: 0,
                userStats: 0,
                archiveObjects: 0,
            },
        });
    });

    it("rejects missing userId", async () => {
        await expect(invoke({})).rejects.toThrow(
            "Missing required field: userId",
        );
    });
});
