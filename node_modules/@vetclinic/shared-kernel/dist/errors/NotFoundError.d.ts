import { AppError } from './AppError';
export declare class NotFoundError extends AppError {
    readonly resourceType?: string | undefined;
    readonly resourceId?: string | undefined;
    constructor(message: string, originalError?: unknown, context?: string, resourceType?: string | undefined, resourceId?: string | undefined);
    static isNotFoundError(error: unknown): error is NotFoundError;
    static fromUnknown(error: unknown, context?: string): NotFoundError;
    static forResource(resourceType: string, resourceId: string, context?: string): NotFoundError;
}
//# sourceMappingURL=NotFoundError.d.ts.map