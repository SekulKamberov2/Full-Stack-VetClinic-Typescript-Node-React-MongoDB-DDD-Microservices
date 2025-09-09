export declare class ErrorHandler {
    static handleAppError(error: unknown, context?: string): never;
    static handleAsync(fn: (...args: any[]) => Promise<any>, context?: string): (...args: any[]) => Promise<any>;
}
