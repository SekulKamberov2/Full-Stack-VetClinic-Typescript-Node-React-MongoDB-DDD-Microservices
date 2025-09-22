"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationError = void 0;
const AppError_1 = require("./AppError");
class AuthorizationError extends AppError_1.AppError {
    constructor(message, originalError, context, requiredPermissions) {
        super(message, 'UNAUTHORIZED', originalError, context);
        this.requiredPermissions = requiredPermissions;
        this.name = 'AuthorizationError';
        Object.setPrototypeOf(this, AuthorizationError.prototype);
    }
    static isAuthorizationError(error) {
        return error instanceof AuthorizationError;
    }
    static fromUnknown(error, context = 'Authorization') {
        const message = AppError_1.AppError.getErrorMessage(error);
        return new AuthorizationError(`${context} failed: ${message}`, error, context);
    }
}
exports.AuthorizationError = AuthorizationError;
//# sourceMappingURL=AuthorizationError.js.map