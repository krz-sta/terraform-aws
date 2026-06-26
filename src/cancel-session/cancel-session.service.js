import { docClient } from "../helpers/db-client.helper.js";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

export async function cancelSession(userId, sessionId) {
    await docClient.send(
        new DeleteCommand({
            TableName: "DBActiveSessions",
            Key: {
                UserId: userId,
                SessionId: sessionId,
            },
            ConditionExpression: "attribute_exists(SessionId)",
        }),
    );
}
