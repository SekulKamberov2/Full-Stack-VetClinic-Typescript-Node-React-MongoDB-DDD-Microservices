export declare class AppError extends Error {
    readonly code: string;
    readonly originalError?: unknown | undefined;
    readonly context?: string | undefined;
    readonly timestamp: Date;
    constructor(message: string, code: string, originalError?: unknown | undefined, context?: string | undefined, timestamp?: Date);
    toJSON(): {
        name: string;
        message: string;
        code: string;
        context: string | undefined;
        timestamp: string;
        stack: string | undefined;
    };
    static isAppError(error: unknown): error is AppError;
    static hasErrorCode(error: unknown): error is {
        code: number | string;
        message?: string;
    };
    static getErrorMessage(error: unknown): string;
    static getErrorCode(error: unknown): string;
    static fromUnknown(error: unknown, context?: string): AppError;
}
//# sourceMappingURL=AppError.d.ts.map