import { AppError } from './AppError';

export class TooManyRequestsError extends AppError {
  constructor(
    message: string = 'Too many requests, please try again later.',
    originalError?: unknown,
    context?: string,
    public readonly retryAfter?: number
  ) {
    super(message, 'TOO_MANY_REQUESTS', originalError, context);
    this.name = 'TooManyRequestsError';
    Object.setPrototypeOf(this, TooManyRequestsError.prototype);
  }

  static isTooManyRequestsError(error: unknown): error is TooManyRequestsError {
    return error instanceof TooManyRequestsError;
  }

  static fromUnknown(error: unknown, context: string = 'RateLimiting'): TooManyRequestsError {
    const message = AppError.getErrorMessage(error);
    return new TooManyRequestsError(
      `${context} failed: ${message}`,
      error,
      context
    );
  }
}