import { unmarshall } from "@aws-sdk/util-dynamodb";
import { SQSEvent } from "aws-lambda/trigger/sqs.js";

export const prepareMessage = (event: SQSEvent) => {
    return unmarshall(
        JSON.parse(JSON.parse(event.Records[0].body).Message).dynamodb.NewImage,
    );
};
