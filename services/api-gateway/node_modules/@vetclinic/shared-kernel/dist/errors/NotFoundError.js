"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotFoundError = void 0;
const AppError_1 = require("./AppError");
class NotFoundError extends AppError_1.AppError {
    constructor(message, originalError, context, resourceType, resourceId) {
        super(message, 'NOT_FOUND', originalError, context);
        this.resourceType = resourceType;
        this.resourceId = resourceId;
        this.name = 'NotFoundError';
        Object.setPrototypeOf(this, NotFoundError.prototype);
    }
    static isNotFoundError(error) {
        return error instanceof NotFoundError;
    }
    static fromUnknown(error, context = 'Resource') {
        const message = AppError_1.AppError.getErrorMessage(error);
        return new NotFoundError(`${context} not found: ${message}`, error, context);
    }
    static forResource(resourceType, resourceId, context) {
        return new NotFoundError(`${resourceType} with ID ${resourceId} not found`, undefined, context, resourceType, resourceId);
    }
}
exports.NotFoundError = NotFoundError;
//# sourceMappingURL=NotFoundError.js.map