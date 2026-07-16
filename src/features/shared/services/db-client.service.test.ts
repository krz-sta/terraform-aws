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
    transactWrite,
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

    it("rejects results that exceed one page", async () => {
        mockedSend.mockResolvedValue({
            Items: [{ id: "1" }],
            LastEvaluatedKey: { pk: "1", sk: "1" },
        });

        await expect(query({ pkName: "pk", pk: "1" }, "table")).rejects.toThrow(
            "DynamoDB query exceeded the single-page limit.",
        );
    });

    it("allows a limited query to return one page", async () => {
        mockedSend.mockResolvedValue({
            Items: [{ id: "1" }],
            LastEvaluatedKey: { pk: "1", sk: "1" },
        });

        const result = await query({ pkName: "pk", pk: "1" }, "table", {
            limit: 1,
        });

        expect(result).toEqual([{ id: "1" }]);
        expect(mockedSend).toHaveBeenCalledTimes(1);
    });
});

describe("transactWrite", () => {
    beforeEach(() => {
        jest.resetAllMocks();
    });

    it("builds put and conditional delete operations", async () => {
        mockedSend.mockResolvedValue({});

        await transactWrite([
            {
                type: "put",
                tableName: "history",
                item: { UserId: "user-123" },
            },
            {
                type: "delete",
                tableName: "active",
                key: {
                    pkName: "UserId",
                    pk: "user-123",
                    skName: "SessionId",
                    sk: "session-456",
                },
            },
        ]);

        const command = mockedSend.mock.calls[0][0] as {
            input: { TransactItems: unknown[] };
        };
        expect(command.input.TransactItems).toEqual([
            {
                Put: {
                    TableName: "history",
                    Item: { UserId: "user-123" },
                },
            },
            {
                Delete: {
                    TableName: "active",
                    Key: {
                        UserId: "user-123",
                        SessionId: "session-456",
                    },
                    ConditionExpression:
                        "attribute_exists(#partitionKey) AND attribute_exists(#sortKey)",
                    ExpressionAttributeNames: {
                        "#partitionKey": "UserId",
                        "#sortKey": "SessionId",
                    },
                },
            },
        ]);
    });
});
