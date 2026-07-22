import crypto from "crypto";
import {
    get,
    put,
    update,
    add,
    delete as deleteItem,
    query,
    transactWrite,
} from "./db-client.service.js";
import {
    ACTIVE_SESSIONS_TABLE,
    USER_STATS_TABLE,
    cleanupUsers,
    makeTestUserId,
    ttlSoon,
} from "../../../test-utils/aws.js";

const testUsers: string[] = [];

function newTestUser() {
    const userId = makeTestUserId();
    testUsers.push(userId);
    return userId;
}

function sessionKey(userId: string, sessionId: string) {
    return {
        pkName: "UserId",
        pk: userId,
        skName: "SessionId",
        sk: sessionId,
    };
}

async function seedSession(userId: string) {
    const sessionId = crypto.randomUUID();
    await put(
        {
            UserId: userId,
            SessionId: sessionId,
            TimeToExist: ttlSoon(),
        },
        ACTIVE_SESSIONS_TABLE,
    );
    return sessionId;
}

afterAll(async () => {
    await cleanupUsers(testUsers);
});

describe("buildKey (via exported operations)", () => {
    it("throws when only skName is provided", async () => {
        await expect(
            get(
                { pkName: "UserId", pk: "1", skName: "SessionId" },
                ACTIVE_SESSIONS_TABLE,
            ),
        ).rejects.toThrow(
            "Sort key name and sort key value must be provided together.",
        );
    });

    it("throws when only sk is provided", async () => {
        await expect(
            get({ pkName: "UserId", pk: "1", sk: "1" }, ACTIVE_SESSIONS_TABLE),
        ).rejects.toThrow(
            "Sort key name and sort key value must be provided together.",
        );
    });
});

describe("get", () => {
    it("returns the item when found", async () => {
        const userId = newTestUser();
        const sessionId = await seedSession(userId);

        const result = await get(
            sessionKey(userId, sessionId),
            ACTIVE_SESSIONS_TABLE,
        );

        expect(result).toEqual(
            expect.objectContaining({
                UserId: userId,
                SessionId: sessionId,
            }),
        );
    });

    it("returns null when the item is not found", async () => {
        const result = await get(
            sessionKey(newTestUser(), crypto.randomUUID()),
            ACTIVE_SESSIONS_TABLE,
        );

        expect(result).toBeNull();
    });
});

describe("update", () => {
    it("short-circuits when there are no attributes to update", async () => {
        const key = sessionKey(newTestUser(), crypto.randomUUID());

        await update(key, {}, ACTIVE_SESSIONS_TABLE);

        await expect(get(key, ACTIVE_SESSIONS_TABLE)).resolves.toBeNull();
    });

    it("sets the provided attributes", async () => {
        const userId = newTestUser();
        const sessionId = await seedSession(userId);
        const key = sessionKey(userId, sessionId);

        await update(key, { name: "value", count: 5 }, ACTIVE_SESSIONS_TABLE);

        await expect(get(key, ACTIVE_SESSIONS_TABLE)).resolves.toEqual(
            expect.objectContaining({ name: "value", count: 5 }),
        );
    });
});

describe("add", () => {
    it("short-circuits when there are no attributes to add", async () => {
        const key = {
            pkName: "UserId",
            pk: newTestUser(),
            skName: "SK",
            sk: "STAT#TOTAL",
        };

        await add(key, {}, USER_STATS_TABLE);

        await expect(get(key, USER_STATS_TABLE)).resolves.toBeNull();
    });

    it("increments the provided attributes", async () => {
        const key = {
            pkName: "UserId",
            pk: newTestUser(),
            skName: "SK",
            sk: "STAT#TOTAL",
        };

        await add(
            key,
            { TotalWorkouts: 1, TotalVolume: 100 },
            USER_STATS_TABLE,
        );
        await add(
            key,
            { TotalWorkouts: 1, TotalVolume: 100 },
            USER_STATS_TABLE,
        );

        await expect(get(key, USER_STATS_TABLE)).resolves.toEqual(
            expect.objectContaining({ TotalWorkouts: 2, TotalVolume: 200 }),
        );
    });
});

describe("delete", () => {
    it("deletes an existing item", async () => {
        const userId = newTestUser();
        const sessionId = await seedSession(userId);
        const key = sessionKey(userId, sessionId);

        await deleteItem(key, ACTIVE_SESSIONS_TABLE);

        await expect(get(key, ACTIVE_SESSIONS_TABLE)).resolves.toBeNull();
    });

    it("rejects when the item does not exist", async () => {
        await expect(
            deleteItem(
                sessionKey(newTestUser(), crypto.randomUUID()),
                ACTIVE_SESSIONS_TABLE,
            ),
        ).rejects.toMatchObject({ name: "ConditionalCheckFailedException" });
    });
});

describe("query", () => {
    it("queries with a partition key only", async () => {
        const userId = newTestUser();
        const first = await seedSession(userId);
        const second = await seedSession(userId);

        const result = await query(
            { pkName: "UserId", pk: userId },
            ACTIVE_SESSIONS_TABLE,
        );

        expect(result.map((item) => item.SessionId as string).sort()).toEqual(
            [first, second].sort(),
        );
    });

    it("queries with a partition and sort key", async () => {
        const userId = newTestUser();
        const sessionId = await seedSession(userId);

        const result = await query(
            sessionKey(userId, sessionId),
            ACTIVE_SESSIONS_TABLE,
        );

        expect(result).toHaveLength(1);
        expect(result[0]).toEqual(
            expect.objectContaining({ SessionId: sessionId }),
        );
    });

    it("returns an empty array when no items are found", async () => {
        const result = await query(
            { pkName: "UserId", pk: newTestUser() },
            ACTIVE_SESSIONS_TABLE,
        );

        expect(result).toEqual([]);
    });

    it("allows a limited query to return one page", async () => {
        const userId = newTestUser();
        await seedSession(userId);
        await seedSession(userId);

        const result = await query(
            { pkName: "UserId", pk: userId },
            ACTIVE_SESSIONS_TABLE,
            { limit: 1 },
        );

        expect(result).toHaveLength(1);
    });
});

describe("transactWrite", () => {
    it("applies put and conditional delete operations atomically", async () => {
        const userId = newTestUser();
        const existingSessionId = await seedSession(userId);
        const createdSessionId = crypto.randomUUID();

        await transactWrite([
            {
                type: "put",
                tableName: ACTIVE_SESSIONS_TABLE,
                item: {
                    UserId: userId,
                    SessionId: createdSessionId,
                    TimeToExist: ttlSoon(),
                },
            },
            {
                type: "delete",
                tableName: ACTIVE_SESSIONS_TABLE,
                key: sessionKey(userId, existingSessionId),
            },
        ]);

        await expect(
            get(sessionKey(userId, createdSessionId), ACTIVE_SESSIONS_TABLE),
        ).resolves.not.toBeNull();
        await expect(
            get(sessionKey(userId, existingSessionId), ACTIVE_SESSIONS_TABLE),
        ).resolves.toBeNull();
    });

    it("rejects when the conditional delete fails", async () => {
        await expect(
            transactWrite([
                {
                    type: "delete",
                    tableName: ACTIVE_SESSIONS_TABLE,
                    key: sessionKey(newTestUser(), crypto.randomUUID()),
                },
            ]),
        ).rejects.toMatchObject({ name: "TransactionCanceledException" });
    });
});
