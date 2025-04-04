import { InvocationContext } from "@azure/functions";

class LoggerHandler {
    private static context: InvocationContext | null = null;
    private static isActive: boolean = true;

    public static setContext(context: InvocationContext): void {
        this.context = context;
        this.isActive = true;
    }

    public static deactivateContext(): void {
        this.isActive = false;
    }

    public static log(message: string): void {
        if (this.context && this.isActive) {
            this.context.log(message);
        } else if (this.context) {
            console.log(message);
        } else {
            throw new Error("InvocationContext is not set.");
        }
    }

    public static error(message: string): void {
        if (this.context && this.isActive) {
            this.context.error(message);
        } else if (this.context) {
            console.error(message);
        } else {
            throw new Error("InvocationContext is not set.");
        }
    }

    public static warn(message: string): void {
        if (this.context && this.isActive) {
            this.context.warn(message);
        } else if (this.context) {
            console.warn(message);
        } else {
            throw new Error("InvocationContext is not set.");
        }
    }
}

export default LoggerHandler;