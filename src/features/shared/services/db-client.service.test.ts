import { jest } from "@jest/globals";

const mockedSend = jest.fn<any>();

jest.unstable_mockModule("../helpers/db-client.helper.js", () => ({
    docClient: { send: mockedSend },
}));

const {
    get,
    update,
    add,
    delete: deleteItem,
    query,
} = await import("./db-client.service.js");

describe("buildKey (via exported operations)", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("throws when only skName is provided", async () => {
        await expect(
            get({ pkName: "pk", pk: "1", skName: "sk" }, "table"),
        ).rejects.toThrow(
            "Sort key name and sort key value must be provided together.",
        );
    });

    it("throws when only sk is provided", async () => {
        await expect(
            get({ pkName: "pk", pk: "1", sk: "1" }, "table"),
        ).rejects.toThrow(
            "Sort key name and sort key value must be provided together.",
        );
    });
});

describe("get", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("returns the item when found", async () => {
        mockedSend.mockResolvedValue({ Item: { id: "1" } });

        const result = await get(
            { pkName: "pk", pk: "1", skName: "sk", sk: "2" },
            "table",
        );

        expect(result).toEqual({ id: "1" });
    });

    it("returns null when the item is not found", async () => {
        mockedSend.mockResolvedValue({});

        const result = await get({ pkName: "pk", pk: "1" }, "table");

        expect(result).toBeNull();
    });
});

describe("update", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("short-circuits when there are no attributes to update", async () => {
        await update({ pkName: "pk", pk: "1" }, {}, "table");

        expect(mockedSend).not.toHaveBeenCalled();
    });

    it("sends an update command when attributes are provided", async () => {
        mockedSend.mockResolvedValue({});

        await update(
            { pkName: "pk", pk: "1" },
            { name: "value", count: 5 },
            "table",
        );

        expect(mockedSend).toHaveBeenCalledTimes(1);
    });
});

describe("add", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("short-circuits when there are no attributes to add", async () => {
        await add({ pkName: "pk", pk: "1" }, {}, "table");

        expect(mockedSend).not.toHaveBeenCalled();
    });

    it("sends an add command when attributes are provided", async () => {
        mockedSend.mockResolvedValue({});

        await add(
            { pkName: "pk", pk: "1" },
            { TotalWorkouts: 1, TotalVolume: 100 },
            "table",
        );

        expect(mockedSend).toHaveBeenCalledTimes(1);
    });
});

describe("delete", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("sends a delete command", async () => {
        mockedSend.mockResolvedValue({});

        await deleteItem({ pkName: "pk", pk: "1" }, "table");

        expect(mockedSend).toHaveBeenCalledTimes(1);
    });

    it("sends a delete command with a sort key", async () => {
        mockedSend.mockResolvedValue({});

        await deleteItem(
            { pkName: "pk", pk: "1", skName: "sk", sk: "2" },
            "table",
        );

        expect(mockedSend).toHaveBeenCalledTimes(1);
    });
});

describe("query", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("queries with a partition key only", async () => {
        mockedSend.mockResolvedValue({ Items: [{ id: "1" }] });

        const result = await query({ pkName: "pk", pk: "1" }, "table");

        expect(result).toEqual([{ id: "1" }]);
    });

    it("queries with a partition and sort key", async () => {
        mockedSend.mockResolvedValue({ Items: [{ id: "1" }] });

        const result = await query(
            { pkName: "pk", pk: "1", skName: "sk", sk: "2" },
            "table",
        );

        expect(result).toEqual([{ id: "1" }]);
    });

    it("returns an empty array when no items are found", async () => {
        mockedSend.mockResolvedValue({});

        const result = await query({ pkName: "pk", pk: "1" }, "table");

        expect(result).toEqual([]);
    });
});
