import { AppError } from './AppError';
export declare class ValidationError extends AppError {
    readonly validationDetails?: Record<string, string[]> | undefined;
    constructor(message: string, originalError?: unknown, context?: string, validationDetails?: Record<string, string[]> | undefined);
    static isValidationError(error: unknown): error is ValidationError;
    static fromUnknown(error: unknown, context?: string): ValidationError;
}
