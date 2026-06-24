const docClient = require('../helpers/dbClient').docClient;
const { GetCommand, DeleteCommand, PutCommand, QueryCommand } = require('@aws-sdk/lib-dynamodb');

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

module.exports = {
    querySession,
    putSession
};