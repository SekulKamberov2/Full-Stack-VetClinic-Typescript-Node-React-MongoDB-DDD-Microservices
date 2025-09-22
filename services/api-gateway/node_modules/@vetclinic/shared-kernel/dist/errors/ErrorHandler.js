"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = void 0;
const index_1 = require("./index");
class ErrorHandler {
    static handleAppError(error, context = 'Operation') {
        if (index_1.AppError.isAppError(error)) {
            throw error;
        }
        if (index_1.ErrorGuards.isMongooseValidationError(error)) {
            throw index_1.ValidationError.fromUnknown(error, context);
        }
        if (index_1.ErrorGuards.isMongoDuplicateError(error)) {
            throw index_1.DuplicateError.fromUnknown(error, context);
        }
        if (index_1.ErrorGuards.isMongooseCastError(error)) {
            throw new index_1.ValidationError('Invalid ID format', error, context);
        }
        throw index_1.AppError.fromUnknown(error, context);
    }
    static handleAsync(fn, context = 'Async operation') {
        return async (...args) => {
            try {
                return await fn(...args);
            }
            catch (error) {
                this.handleAppError(error, context);
            }
        };
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=ErrorHandler.js.map