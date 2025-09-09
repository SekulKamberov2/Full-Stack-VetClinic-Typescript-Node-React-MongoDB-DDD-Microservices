import mongoose from 'mongoose';
export declare class AppError extends Error {
    readonly code: string;
    readonly originalError?: unknown | undefined;
    constructor(message: string, code: string, originalError?: unknown | undefined);
    static isAppError(error: unknown): error is AppError;
    static hasErrorCode(error: unknown): error is {
        code: number | string;
        message?: string;
    };
    static isDuplicateKeyError(error: unknown): boolean;
    static getErrorMessage(error: unknown): string;
    static getErrorCode(error: unknown): string;
    static fromUnknown(error: unknown, context?: string): AppError;
}
export declare class ValidationError extends AppError {
    constructor(message: string, originalError?: unknown);
    static isValidationError(error: unknown): error is ValidationError;
    static fromUnknown(error: unknown, context?: string): ValidationError;
}
export declare class NotFoundError extends AppError {
    constructor(message: string, originalError?: unknown);
    static isNotFoundError(error: unknown): error is NotFoundError;
    static fromUnknown(error: unknown, context?: string): NotFoundError;
}
export declare class DuplicateError extends AppError {
    constructor(message: string, originalError?: unknown);
    static isDuplicateError(error: unknown): error is DuplicateError;
    static fromUnknown(error: unknown, context?: string): DuplicateError;
}
export declare const ErrorGuards: {
    isError(error: unknown): error is Error;
    isString(error: unknown): error is string;
    isObjectWithCode(error: unknown): error is {
        code: number | string;
        message?: string;
    };
    isMongoDuplicateError(error: unknown): boolean;
    isMongooseValidationError(error: unknown): error is mongoose.Error.ValidationError;
};
export declare class ErrorHandler {
    static handleAppError(error: unknown, context?: string): never;
}
//# sourceMappingURL=AppError.d.ts.map