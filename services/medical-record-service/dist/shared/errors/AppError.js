"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorHandler = exports.ErrorGuards = exports.DuplicateError = exports.NotFoundError = exports.ValidationError = exports.AppError = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
class AppError extends Error {
    constructor(message, code, originalError) {
        super(message);
        this.code = code;
        this.originalError = originalError;
        this.name = 'AppError';
        Object.setPrototypeOf(this, AppError.prototype);
    }
    static isAppError(error) {
        return error instanceof AppError;
    }
    static hasErrorCode(error) {
        return typeof error === 'object' && error !== null && 'code' in error;
    }
    static isDuplicateKeyError(error) {
        return this.hasErrorCode(error) && error.code === 11000;
    }
    static getErrorMessage(error) {
        if (error instanceof Error) {
            return error.message;
        }
        else if (typeof error === 'string') {
            return error;
        }
        else if (this.hasErrorCode(error) && error.message) {
            return error.message;
        }
        else {
            return 'An unknown error occurred';
        }
    }
    static getErrorCode(error) {
        if (this.hasErrorCode(error)) {
            return error.code.toString();
        }
        return 'UNKNOWN_ERROR';
    }
    static fromUnknown(error, context = 'Operation') {
        const message = this.getErrorMessage(error);
        const code = this.getErrorCode(error);
        return new AppError(`${context} failed: ${message}`, code, error);
    }
}
exports.AppError = AppError;
class ValidationError extends AppError {
    constructor(message, originalError) {
        super(message, 'VALIDATION_ERROR', originalError);
        this.name = 'ValidationError';
        Object.setPrototypeOf(this, ValidationError.prototype);
    }
    static isValidationError(error) {
        return error instanceof ValidationError;
    }
    static fromUnknown(error, context = 'Validation') {
        const message = AppError.getErrorMessage(error);
        return new ValidationError(`${context} failed: ${message}`, error);
    }
}
exports.ValidationError = ValidationError;
class NotFoundError extends AppError {
    constructor(message, originalError) {
        super(message, 'NOT_FOUND', originalError);
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
    static isNotFoundError(error) {
        return error instanceof NotFoundError;
    }
    static fromUnknown(error, context = 'Resource') {
        const message = AppError.getErrorMessage(error);
        return new NotFoundError(`${context} not found: ${message}`, error);
    }
}
exports.NotFoundError = NotFoundError;
class DuplicateError extends AppError {
    constructor(message, originalError) {
        super(message, 'DUPLICATE', originalError);
        this.name = 'DuplicateError';
        Object.setPrototypeOf(this, DuplicateError.prototype);
    }
    static isDuplicateError(error) {
        return error instanceof DuplicateError;
    }
    static fromUnknown(error, context = 'Resource') {
        const message = AppError.getErrorMessage(error);
        return new DuplicateError(`${context} already exists: ${message}`, error);
    }
}
exports.DuplicateError = DuplicateError;
exports.ErrorGuards = {
    isError(error) {
        return error instanceof Error;
    },
    isString(error) {
        return typeof error === 'string';
    },
    isObjectWithCode(error) {
        return typeof error === 'object' && error !== null && 'code' in error;
    },
    isMongoDuplicateError(error) {
        return exports.ErrorGuards.isObjectWithCode(error) && error.code === 11000;
    },
    isMongooseValidationError(error) {
        return error instanceof mongoose_1.default.Error.ValidationError;
    }
};
class ErrorHandler {
    static handleAppError(error, context = 'Repository operation') {
        if (AppError.isAppError(error)) {
            throw error;
        }
        if (exports.ErrorGuards.isMongooseValidationError(error)) {
            throw ValidationError.fromUnknown(error, context);
        }
        if (exports.ErrorGuards.isMongoDuplicateError(error)) {
            throw DuplicateError.fromUnknown(error, context);
        }
        throw AppError.fromUnknown(error, context);
    }
}
exports.ErrorHandler = ErrorHandler;
//# sourceMappingURL=AppError.js.map