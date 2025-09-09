"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppError = void 0;
class AppError extends Error {
    constructor(message, code, originalError, context, timestamp = new Date()) {
        super(message);
        this.code = code;
        this.originalError = originalError;
        this.context = context;
        this.timestamp = timestamp;
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
    static isAppError(error) {
        return error instanceof AppError;
    }
    static hasErrorCode(error) {
        return typeof error === 'object' && error !== null && 'code' in error;
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
        return new AppError(`${context} failed: ${message}`, code, error, context);
    }
}
exports.AppError = AppError;
