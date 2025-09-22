"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorGuards = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
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
        return this.isObjectWithCode(error) && error.code === 11000;
    },
    isMongooseValidationError(error) {
        return error instanceof mongoose_1.default.Error.ValidationError;
    },
    isMongooseCastError(error) {
        return error instanceof mongoose_1.default.Error.CastError;
    }
};
//# sourceMappingURL=ErrorGuards.js.map