"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidationError = void 0;
const AppError_1 = require("./AppError");
class ValidationError extends AppError_1.AppError {
    constructor(message, originalError, context, validationDetails) {
        super(message, 'VALIDATION_ERROR', originalError, context);
        this.validationDetails = validationDetails;
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
    static isValidationError(error) {
        return error instanceof ValidationError;
    }
    static fromUnknown(error, context = 'Validation') {
        const message = AppError_1.AppError.getErrorMessage(error);
        return new ValidationError(`${context} failed: ${message}`, error, context);
    }
}
exports.ValidationError = ValidationError;
//# sourceMappingURL=ValidationError.js.map