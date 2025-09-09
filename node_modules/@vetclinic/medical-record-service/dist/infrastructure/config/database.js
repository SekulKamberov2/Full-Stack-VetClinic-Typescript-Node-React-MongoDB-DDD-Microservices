"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDatabaseStats = exports.checkDatabaseHealth = exports.closeDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const MedicalRecord_1 = require("../persistence/models/MedicalRecord");
const DiagnosisModel_1 = require("../persistence/models/DiagnosisModel");
const TreatmentModel_1 = require("../persistence/models/TreatmentModel");
const PrescriptionModel_1 = require("../persistence/models/PrescriptionModel");
const connectDB = async (uri) => {
    try {
        await mongoose_1.default.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        await createIndexes();
    }
    catch (error) {
        console.error('MongoDB connection error:', error);
        throw error;
    }
};
exports.connectDB = connectDB;
const createIndexes = async () => {
    try {
        await MedicalRecord_1.MedicalRecordModel.createIndexes();
        if (DiagnosisModel_1.DiagnosisModel && DiagnosisModel_1.DiagnosisModel.createIndexes) {
            await DiagnosisModel_1.DiagnosisModel.createIndexes();
        }
        if (TreatmentModel_1.TreatmentModel && TreatmentModel_1.TreatmentModel.createIndexes) {
            await TreatmentModel_1.TreatmentModel.createIndexes();
        }
        if (PrescriptionModel_1.PrescriptionModel && PrescriptionModel_1.PrescriptionModel.createIndexes) {
            await PrescriptionModel_1.PrescriptionModel.createIndexes();
        }
    }
    catch (error) {
        console.error('Error creating database indexes:', error);
    }
};
const closeDB = async () => {
    try {
        await mongoose_1.default.connection.close();
    }
    catch (error) {
        console.error('Error closing MongoDB connection:', error);
        throw error;
    }
};
exports.closeDB = closeDB;
const checkDatabaseHealth = async () => {
    try {
        await mongoose_1.default.connection.db.admin().ping();
        return true;
    }
    catch (error) {
        console.error('Database health check failed:', error);
        return false;
    }
};
exports.checkDatabaseHealth = checkDatabaseHealth;
const getDatabaseStats = async () => {
    try {
        const stats = await mongoose_1.default.connection.db.stats();
        return stats;
    }
    catch (error) {
        console.error('Failed to get database stats:', error);
        throw error;
    }
};
exports.getDatabaseStats = getDatabaseStats;
mongoose_1.default.connection.on('connected', () => {
    console.log('MongoDB connection established');
});
mongoose_1.default.connection.on('error', (error) => {
    console.error('MongoDB connection error:', error);
});
mongoose_1.default.connection.on('disconnected', () => {
    console.log('MongoDB connection disconnected');
});
mongoose_1.default.connection.on('reconnected', () => {
    console.log('MongoDB connection reestablished');
});
//# sourceMappingURL=database.js.map