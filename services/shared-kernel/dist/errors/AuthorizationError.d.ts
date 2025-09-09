import { AppError } from './AppError';
export declare class AuthorizationError extends AppError {
    readonly requiredPermissions?: string[] | undefined;
    constructor(message: string, originalError?: unknown, context?: string, requiredPermissions?: string[] | undefined);
    static isAuthorizationError(error: unknown): error is AuthorizationError;
    static fromUnknown(error: unknown, context?: string): AuthorizationError;
}
