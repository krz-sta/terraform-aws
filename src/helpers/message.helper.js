import { unmarshall } from "@aws-sdk/util-dynamodb";

export const prepareMessage = (event) => {
    return unmarshall(
        JSON.parse(JSON.parse(event.Records[0].body).Message).dynamodb.NewImage,
    );
};
