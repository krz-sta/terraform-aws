export const handler = async (event) => {
    console.log("Received event:", JSON.stringify(event, null, 2));
    console.log(event);
    console.log("event.body:", event.body);
    console.log("event.Records:", event.Records);
    return {
        statusCode: 200,
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            message: "Status OK.",
        }),
    };
};
