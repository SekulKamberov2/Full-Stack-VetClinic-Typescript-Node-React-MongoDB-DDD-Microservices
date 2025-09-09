export class AppError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly originalError?: unknown,
    public readonly context?: string,
    public readonly timestamp: Date = new Date()
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }

  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      context: this.context,
      timestamp: this.timestamp.toISOString(),
      stack: this.stack
    };
  }

  static isAppError(error: unknown): error is AppError {
    return error instanceof AppError;
  }

  static hasErrorCode(error: unknown): error is { code: number | string; message?: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
  }

  static getErrorMessage(error: unknown): string {
    if (error instanceof Error) {
      return error.message;
    } else if (typeof error === 'string') {
      return error;
    } else if (this.hasErrorCode(error) && error.message) {
      return error.message;
    } else {
      return 'An unknown error occurred';
    }
  }

  static getErrorCode(error: unknown): string {
    if (this.hasErrorCode(error)) {
      return error.code.toString();
    }
    return 'UNKNOWN_ERROR';
  }

  static fromUnknown(error: unknown, context: string = 'Operation'): AppError {
    const message = this.getErrorMessage(error);
    const code = this.getErrorCode(error);
    
    return new AppError(
      `${context} failed: ${message}`,
      code,
      error,
      context
    );
  }
}
