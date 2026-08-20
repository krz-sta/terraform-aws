import { Tracer as PowertoolsTracer } from "@aws-lambda-powertools/tracer";

type TraceValue = string | number | boolean;

export class Tracer {
    readonly powertoolsTracer: PowertoolsTracer;

    constructor() {
        this.powertoolsTracer = new PowertoolsTracer({
            serviceName: "terraform-aws",
        });
    }

    captureAWSv3Client<T>(service: T): T {
        return this.powertoolsTracer.captureAWSv3Client(service);
    }

    putAnnotation(key: string, value: TraceValue): void {
        this.powertoolsTracer.putAnnotation(key, value);
    }

    putMetadata(key: string, value: unknown, namespace?: string): void {
        this.powertoolsTracer.putMetadata(key, value, namespace);
    }

    annotateColdStart(): void {
        this.powertoolsTracer.annotateColdStart();
    }

    addServiceNameAnnotation(): void {
        this.powertoolsTracer.addServiceNameAnnotation();
    }
}

export const tracer = new Tracer();
