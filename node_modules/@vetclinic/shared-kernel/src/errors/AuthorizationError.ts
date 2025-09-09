import { AppError } from './AppError';

export class AuthorizationError extends AppError {
  constructor(
    message: string, 
    originalError?: unknown,
    context?: string,
    public readonly requiredPermissions?: string[]
  ) {
    super(message, 'UNAUTHORIZED', originalError, context);
    this.name = 'AuthorizationError';
    Object.setPrototypeOf(this, AuthorizationError.prototype);
  }

  static isAuthorizationError(error: unknown): error is AuthorizationError {
    return error instanceof AuthorizationError;
  }

  static fromUnknown(error: unknown, context: string = 'Authorization'): AuthorizationError {
    const message = AppError.getErrorMessage(error);
    return new AuthorizationError(
      `${context} failed: ${message}`,
      error,
      context
    );
  }
}
