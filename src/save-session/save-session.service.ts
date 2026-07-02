import { docClient } from "../helpers/db-client.helper.js";
import { TransactWriteCommand } from "@aws-sdk/lib-dynamodb";

const ACTIVE_SESSIONS_TABLE_NAME = process.env.ACTIVE_SESSIONS_TABLE_NAME;
const SESSION_HISTORY_TABLE_NAME = process.env.SESSION_HISTORY_TABLE_NAME;

if (!ACTIVE_SESSIONS_TABLE_NAME || !SESSION_HISTORY_TABLE_NAME) {
    throw new Error("Missing environment variables.");
}

export const saveSession = async (sessionData: any) => {
    await docClient.send(
        new TransactWriteCommand({
            TransactItems: [
                {
                    Put: {
                        TableName: SESSION_HISTORY_TABLE_NAME,
                        Item: sessionData,
                    },
                },
                {
                    Delete: {
                        TableName: ACTIVE_SESSIONS_TABLE_NAME,
                        Key: {
                            UserId: sessionData.UserId,
                            SessionId: sessionData.SessionId,
                        },
                        ConditionExpression:
                            "attribute_exists(UserId) AND attribute_exists(SessionId)",
                    },
                },
            ],
        }),
    );
};
