import { AppError, ValidationError, DuplicateError, ErrorGuards } from './index';

export class ErrorHandler {
  static handleAppError(error: unknown, context: string = 'Operation'): never {
    if (AppError.isAppError(error)) {
      throw error;
    }
    
    if (ErrorGuards.isMongooseValidationError(error)) {
      throw ValidationError.fromUnknown(error, context);
    }
    
    if (ErrorGuards.isMongoDuplicateError(error)) {
      throw DuplicateError.fromUnknown(error, context);
    }
    
    if (ErrorGuards.isMongooseCastError(error)) {
      throw new ValidationError('Invalid ID format', error, context);
    }
    
    throw AppError.fromUnknown(error, context);
  }

  static handleAsync(
    fn: (...args: any[]) => Promise<any>,
    context: string = 'Async operation'
  ): (...args: any[]) => Promise<any> {
    return async (...args: any[]) => {
      try {
        return await fn(...args);
      } catch (error) {
        this.handleAppError(error, context);
      }
    };
  }
}
