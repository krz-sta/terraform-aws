import {
    getSessionByIds,
    updateSession,
} from "../services/active-session.service.js";

export const handler = async (event) => {
    let body;
    try {
        body = JSON.parse(event.body || "{}");
    } catch (e) {
        console.error("Error parsing JSON:", e);
        return {
            statusCode: 400,
            body: JSON.stringify({
                message: "Invalid JSON in request body.",
            }),
        };
    }

    if (
        !body.userId ||
        !body.sessionId ||
        !body.exerciseName ||
        typeof body.setIndex !== "number"
    ) {
        return {
            statusCode: 400,
            body: JSON.stringify({
                message:
                    "Missing userId, sessionId, exerciseName or setIndex in request body.",
            }),
        };
    }

    try {
        const currentSession = await getSessionByIds(
            body.userId,
            body.sessionId,
        );

        if (!currentSession) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Session not found.",
                }),
            };
        }

        let updatedExercises = currentSession.Exercises || {};
        const exerciseName = body.exerciseName;

        if (
            !updatedExercises[exerciseName] ||
            !updatedExercises[exerciseName].Sets[body.setIndex]
        ) {
            return {
                statusCode: 404,
                body: JSON.stringify({
                    message: "Exercise or set not found in the session.",
                }),
            };
        }

        updatedExercises[exerciseName].Sets.splice(body.setIndex, 1);

        await updateSession(body.userId, body.sessionId, updatedExercises);

        return {
            statusCode: 200,
            body: JSON.stringify({
                message: "Set deleted successfully.",
            }),
        };
    } catch (e) {
        console.error("Error deleting set:", e);
        return {
            statusCode: 500,
            body: JSON.stringify({
                message: "Error deleting set.",
            }),
        };
    }
};
