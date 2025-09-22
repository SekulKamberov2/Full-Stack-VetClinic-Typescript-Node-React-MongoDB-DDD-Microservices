import mongoose from 'mongoose';
export declare const ErrorGuards: {
    isError(error: unknown): error is Error;
    isString(error: unknown): error is string;
    isObjectWithCode(error: unknown): error is {
        code: number | string;
        message?: string;
    };
    isMongoDuplicateError(error: unknown): boolean;
    isMongooseValidationError(error: unknown): error is mongoose.Error.ValidationError;
    isMongooseCastError(error: unknown): error is mongoose.Error.CastError;
};
//# sourceMappingURL=ErrorGuards.d.ts.map