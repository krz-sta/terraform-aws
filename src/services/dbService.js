const docClient = require('../helpers/dbClient').docClient;
const { GetCommand, DeleteCommand, PutCommand, QueryCommand, TransactWriteCommand } = require('@aws-sdk/lib-dynamodb');

async function querySession(userId) {
    const existing = await docClient.send(new QueryCommand({
        TableName: "DBActiveSessions",
        KeyConditionExpression: 'UserId = :userId',
        ExpressionAttributeValues: {
            ':userId': userId
        }
    }));

    return existing.Items.length > 0 ? existing.Items[0] : null;
}

async function putSession(userId) {
    const sessionId = crypto.randomUUID();
    const ttl = Math.floor(Date.now() / 1000) + (8 * 3600); // 8 hours

    await docClient.send(new PutCommand({
        TableName: "DBActiveSessions",
        Item: {
            UserId: userId,
            SessionId: sessionId,
            TimeToExist: ttl,
            startTime: new Date().toISOString()
        }
    }));
    
    return sessionId;
}

async function getSession(userId, sessionId) {
    const result = await docClient.send(new GetCommand({
        TableName: "DBActiveSessions",
        Key: {
            UserId: userId,
            SessionId: sessionId
        }
    }));

    return result.Item || null;
}

async function deleteSession(userId, sessionId) {
    await docClient.send(new DeleteCommand({
        TableName: "DBActiveSessions",
        Key: {
            UserId: userId,
            SessionId: sessionId
        },
        ConditionExpression: 'attribute_exists(SessionId)'
    }));
}

async function saveSession(sessionData) {
    await docClient.send(new TransactWriteCommand({
        TransactItems: [
            {
                Put: {
                    TableName: "DBSessionHistory",
                    Item: sessionData
                }
            },
            {
                Delete: {
                    TableName: "DBActiveSessions",
                    Key: {
                        UserId: sessionData.UserId,
                        SessionId: sessionData.SessionId
                    },
                    ConditionExpression: 'attribute_exists(UserId) AND attribute_exists(SessionId)'
                }
            }
        ]
    }));
}

module.exports = {
    querySession,
    putSession,
    getSession,
    deleteSession,
    saveSession
};
