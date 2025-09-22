import mongoose from 'mongoose';

export const ErrorGuards = {
  isError(error: unknown): error is Error {
    return error instanceof Error;
  },
  
  isString(error: unknown): error is string {
    return typeof error === 'string';
  },
  
  isObjectWithCode(error: unknown): error is { code: number | string; message?: string } {
    return typeof error === 'object' && error !== null && 'code' in error;
  },
  
  isMongoDuplicateError(error: unknown): boolean {
    return this.isObjectWithCode(error) && error.code === 11000;
  },
  
  isMongooseValidationError(error: unknown): error is mongoose.Error.ValidationError {
    return error instanceof mongoose.Error.ValidationError;
  },
  
  isMongooseCastError(error: unknown): error is mongoose.Error.CastError {
    return error instanceof mongoose.Error.CastError;
  }
};
