"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseController = void 0;
const AppError_1 = require("./AppError");
const ValidationError_1 = require("./ValidationError");
const NotFoundError_1 = require("./NotFoundError");
const AuthorizationError_1 = require("./AuthorizationError");
const ErrorHandler_1 = require("./ErrorHandler");
class BaseController {
    handleSuccess(res, data, statusCode = 200) {
        res.status(statusCode).json({
            success: true,
            data
        });
    }
    handleError(res, error) {
        console.error(`${this.constructor.name} error:`, error);
        if (AppError_1.AppError.isAppError(error)) {
            const statusCode = this.getStatusCode(error);
            res.status(statusCode).json({
                success: false,
                error: {
                    message: error.message,
                    code: error.code,
                    context: error.context,
                    timestamp: error.timestamp.toISOString()
                }
            });
            return;
        }
        const unknownError = ErrorHandler_1.ErrorHandler.handleAppError(error, this.constructor.name);
        res.status(500).json({
            success: false,
            error: {
                message: "Internal server error",
                code: "INTERNAL_ERROR",
                timestamp: new Date().toISOString()
            }
        });
    }
    validateRequiredParam(param, paramName, context = 'Controller') {
        if (!param || (typeof param === 'string' && param.trim() === '')) {
            throw new ValidationError_1.ValidationError(`${paramName} is required`, undefined, context);
        }
    }
    validateObjectId(id, paramName, context = 'Controller') {
        this.validateRequiredParam(id, paramName, context);
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            throw new ValidationError_1.ValidationError(`Invalid ${paramName} format`, undefined, context);
        }
    }
    getStatusCode(error) {
        if (error instanceof ValidationError_1.ValidationError) {
            return 400;
        }
        else if (error instanceof NotFoundError_1.NotFoundError) {
            return 404;
        }
        else if (error instanceof AuthorizationError_1.AuthorizationError) {
            return 403;
        }
        else if (error.code === 'UNAUTHORIZED') {
            return 401;
        }
        else {
            return 500;
        }
    }
}
exports.BaseController = BaseController;
//# sourceMappingURL=BaseController.js.map