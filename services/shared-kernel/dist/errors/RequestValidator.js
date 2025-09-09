"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestValidator = void 0;
const ValidationError_1 = require("./ValidationError");
class RequestValidator {
    static validateRequiredParams(req, paramNames, context = 'RequestValidator') {
        for (const paramName of paramNames) {
            const param = req.params[paramName] || req.body[paramName] || req.query[paramName];
            if (!param || (typeof param === 'string' && param.trim() === '')) {
                throw new ValidationError_1.ValidationError(`${paramName} is required`, undefined, context);
            }
        }
    }
    static validateObjectIds(req, paramNames, context = 'RequestValidator') {
        for (const paramName of paramNames) {
            const param = req.params[paramName] || req.body[paramName] || req.query[paramName];
            this.validateObjectId(param, paramName, context);
        }
    }
    static validateObjectId(id, paramName, context = 'RequestValidator') {
        this.validateRequiredParam(id, paramName, context);
        if (!/^[0-9a-fA-F]{24}$/.test(id)) {
            throw new ValidationError_1.ValidationError(`Invalid ${paramName} format`, undefined, context);
        }
    }
    static validateRequiredParam(param, paramName, context = 'RequestValidator') {
        if (!param || (typeof param === 'string' && param.trim() === '')) {
            throw new ValidationError_1.ValidationError(`${paramName} is required`, undefined, context);
        }
    }
}
exports.RequestValidator = RequestValidator;
