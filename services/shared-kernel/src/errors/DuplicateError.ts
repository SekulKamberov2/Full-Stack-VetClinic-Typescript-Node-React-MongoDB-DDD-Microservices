import { AppError } from './AppError';

export class DuplicateError extends AppError {
  constructor(
    message: string, 
    originalError?: unknown,
    context?: string,
    public readonly duplicateField?: string
  ) {
    super(message, 'DUPLICATE_ERROR', originalError, context);
    this.name = 'DuplicateError';
    Object.setPrototypeOf(this, DuplicateError.prototype);
  }

  static isDuplicateError(error: unknown): error is DuplicateError {
    return error instanceof DuplicateError;
  }

  static fromUnknown(error: unknown, context: string = 'Resource'): DuplicateError {
    const message = AppError.getErrorMessage(error);
    return new DuplicateError(
      `${context} already exists: ${message}`,
      error,
      context
    );
  }
}
