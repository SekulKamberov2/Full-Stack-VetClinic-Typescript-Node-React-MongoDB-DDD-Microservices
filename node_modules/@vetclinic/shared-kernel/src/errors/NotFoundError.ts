import { AppError } from './AppError';

export class NotFoundError extends AppError {
  constructor(
    message: string, 
    originalError?: unknown,
    context?: string,
    public readonly resourceType?: string,
    public readonly resourceId?: string
  ) {
    super(message, 'NOT_FOUND', originalError, context);
    this.name = 'NotFoundError';
    Object.setPrototypeOf(this, NotFoundError.prototype);
  }

  static isNotFoundError(error: unknown): error is NotFoundError {
    return error instanceof NotFoundError;
  }

  static fromUnknown(error: unknown, context: string = 'Resource'): NotFoundError {
    const message = AppError.getErrorMessage(error);
    return new NotFoundError(
      `${context} not found: ${message}`,
      error,
      context
    );
  }

  static forResource(resourceType: string, resourceId: string, context?: string): NotFoundError {
    return new NotFoundError(
      `${resourceType} with ID ${resourceId} not found`,
      undefined,
      context,
      resourceType,
      resourceId
    );
  }
}
