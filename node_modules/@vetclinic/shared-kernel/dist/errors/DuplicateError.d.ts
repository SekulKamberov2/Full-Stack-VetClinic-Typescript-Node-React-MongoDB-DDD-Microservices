import { AppError } from './AppError';
export declare class DuplicateError extends AppError {
    readonly duplicateField?: string | undefined;
    constructor(message: string, originalError?: unknown, context?: string, duplicateField?: string | undefined);
    static isDuplicateError(error: unknown): error is DuplicateError;
    static fromUnknown(error: unknown, context?: string): DuplicateError;
}
//# sourceMappingURL=DuplicateError.d.ts.map