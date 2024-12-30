import { InvocationContext } from "@azure/functions";

class LoggerHandler {
    private static context: InvocationContext | null = null;

    public static setContext(context: InvocationContext): void {
        this.context = context;
    }

    public static log(message: string): void {
        if (this.context) {
            this.context.log(message);
        } else {
            throw new Error("InvocationContext is not set.");
        }
    }

    public static error(message: string): void {
        if (this.context) {
            this.context.error(message);
        } else {
            throw new Error("InvocationContext is not set.");
        }
    }
}

export default LoggerHandler;