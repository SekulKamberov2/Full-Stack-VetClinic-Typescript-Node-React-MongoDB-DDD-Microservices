import { AppError } from './AppError';

export class ValidationError extends AppError {
  constructor(
    message: string, 
    originalError?: unknown,
    context?: string,
    public readonly validationDetails?: Record<string, string[]>
  ) {
    super(message, 'VALIDATION_ERROR', originalError, context);
    this.name = 'ValidationError';
    Object.setPrototypeOf(this, ValidationError.prototype);
  }

  static isValidationError(error: unknown): error is ValidationError {
    return error instanceof ValidationError;
  }

  static fromUnknown(error: unknown, context: string = 'Validation'): ValidationError {
    const message = AppError.getErrorMessage(error);
    return new ValidationError(
      `${context} failed: ${message}`,
      error,
      context
    );
  }
}
