"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseMongoRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = require("../../shared/errors/AppError");
class BaseMongoRepository {
    isValidObjectId(id) {
        return mongoose_1.default.Types.ObjectId.isValid(id);
    }
    validateId(id) {
        if (!this.isValidObjectId(id)) {
            throw new Error(`Invalid ID format: ${id}`);
        }
    }
    async exists(id) {
        this.validateId(id);
        const count = await this.model.countDocuments({ _id: id }).exec();
        return count > 0;
    }
    async delete(id) {
        this.validateId(id);
        const result = await this.model.findByIdAndDelete(id).exec();
        if (!result) {
            throw new AppError_1.NotFoundError(`Entity with ID ${id} not found`);
        }
    }
    handleDatabaseError(error, operation) {
        console.error(`Database error during ${operation}:`, error);
        if (error instanceof mongoose_1.default.Error.ValidationError) {
            throw new Error(`Validation failed: ${error.message}`);
        }
        if (error instanceof mongoose_1.default.Error.CastError) {
            throw new Error(`Invalid ID format: ${error.value}`);
        }
        if (error instanceof Error && error.message.includes('not found')) {
            throw error;
        }
        throw new Error(`Database operation failed: ${operation}`);
    }
    async executeWithLogging(operation, fn) {
        const startTime = Date.now();
        try {
            const result = await fn();
            const duration = Date.now() - startTime;
            console.log(`${this.constructor.name}.${operation} completed in ${duration}ms`);
            return result;
        }
        catch (error) {
            const duration = Date.now() - startTime;
            console.error(`${this.constructor.name}.${operation} failed after ${duration}ms:`, error);
            throw error;
        }
    }
}
exports.BaseMongoRepository = BaseMongoRepository;
//# sourceMappingURL=BaseMongoRepository.js.map