"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DuplicateError = void 0;
const AppError_1 = require("./AppError");
class DuplicateError extends AppError_1.AppError {
    constructor(message, originalError, context, duplicateField) {
        super(message, 'DUPLICATE_ERROR', originalError, context);
        this.duplicateField = duplicateField;
        this.name = 'DuplicateError';
        Object.setPrototypeOf(this, DuplicateError.prototype);
    }
    static isDuplicateError(error) {
        return error instanceof DuplicateError;
    }
    static fromUnknown(error, context = 'Resource') {
        const message = AppError_1.AppError.getErrorMessage(error);
        return new DuplicateError(`${context} already exists: ${message}`, error, context);
    }
}
exports.DuplicateError = DuplicateError;
