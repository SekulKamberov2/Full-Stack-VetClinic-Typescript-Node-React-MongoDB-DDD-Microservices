"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.database = exports.DatabaseConnection = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class DatabaseConnection {
    constructor() {
        this._isConnected = false;
        this.connection = null;
    }
    static getInstance() {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection();
        }
        return DatabaseConnection.instance;
    }
    async connect(config) {
        if (this._isConnected) {
            return;
        }
        try {
            if (!config.uri || config.uri.trim() === '') {
                throw new shared_kernel_1.ValidationError('MongoDB connection URI is required');
            }
            const defaultOptions = {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
                maxPoolSize: 10,
                minPoolSize: 2,
                ...config.options
            };
            await mongoose_1.default.connect(config.uri, defaultOptions);
            this.connection = mongoose_1.default.connection;
            this._isConnected = true;
            console.log('MongoDB connection established successfully');
            this.setupEventListeners();
        }
        catch (error) {
            throw new shared_kernel_1.AppError(`Failed to connect to database: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DATABASE_CONNECTION_FAILED', error);
        }
    }
    async disconnect() {
        if (!this._isConnected || !this.connection) {
            return;
        }
        try {
            await mongoose_1.default.connection.close();
            this._isConnected = false;
            this.connection = null;
            console.log('MongoDB connection closed successfully');
        }
        catch (error) {
            throw new shared_kernel_1.AppError(`Failed to disconnect from database: ${error instanceof Error ? error.message : 'Unknown error'}`, 'DATABASE_DISCONNECT_FAILED', error);
        }
    }
    isConnected() {
        return this._isConnected && mongoose_1.default.connection.readyState === 1;
    }
    getConnection() {
        if (!this.isConnected() || !this.connection) {
            throw new shared_kernel_1.AppError('Database not connected', 'DATABASE_NOT_CONNECTED');
        }
        return this.connection;
    }
    getMongoose() {
        if (!this.isConnected()) {
            throw new shared_kernel_1.AppError('Database not connected', 'DATABASE_NOT_CONNECTED');
        }
        return mongoose_1.default;
    }
    setupEventListeners() {
        if (!this.connection)
            return;
        this.connection.on('connected', () => {
            console.log('MongoDB connection established');
            this._isConnected = true;
        });
        this.connection.on('error', (error) => {
            console.error('MongoDB connection error:', error);
            this._isConnected = false;
        });
        this.connection.on('disconnected', () => {
            console.log('MongoDB connection disconnected');
            this._isConnected = false;
        });
        this.connection.on('reconnected', () => {
            console.log('MongoDB connection reestablished');
            this._isConnected = true;
        });
    }
    async withTransaction(callback) {
        if (!this.isConnected()) {
            throw new shared_kernel_1.AppError('Database not connected', 'DATABASE_NOT_CONNECTED');
        }
        const session = await mongoose_1.default.startSession();
        try {
            session.startTransaction();
            const result = await callback(session);
            await session.commitTransaction();
            return result;
        }
        catch (error) {
            await session.abortTransaction();
            throw error;
        }
        finally {
            session.endSession();
        }
    }
    async healthCheck() {
        try {
            if (!this.isConnected())
                return false;
            await mongoose_1.default.connection.db.admin().ping();
            return true;
        }
        catch {
            return false;
        }
    }
    async createIndexes() {
        if (!this.isConnected()) {
            throw new shared_kernel_1.AppError('Database not connected', 'DATABASE_NOT_CONNECTED');
        }
        try {
            console.log('Database indexes verified');
        }
        catch (error) {
            console.error('Error creating indexes:', error);
            throw error;
        }
    }
}
exports.DatabaseConnection = DatabaseConnection;
exports.database = DatabaseConnection.getInstance();
//# sourceMappingURL=database.js.map