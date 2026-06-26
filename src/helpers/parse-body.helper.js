export function parseBody(eventBody) {
    try {
        return JSON.parse(eventBody || "{}");
    } catch (e) {
        console.error("Error parsing JSON:", e);
        return null;
    }
}
