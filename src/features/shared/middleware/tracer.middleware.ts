import { captureLambdaHandler } from "@aws-lambda-powertools/tracer/middleware";
import { tracer } from "../services/tracer.service.js";

function tracerMiddleware() {
    return captureLambdaHandler(tracer.powertoolsTracer);
}

export { tracerMiddleware as tracer };
