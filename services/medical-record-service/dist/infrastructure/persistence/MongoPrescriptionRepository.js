"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoPrescriptionRepository = void 0;
const Prescription_1 = require("../../domain/entities/Prescription");
const PrescriptionModel_1 = require("../persistence/models/PrescriptionModel");
const MedicalRecord_1 = require("../persistence/models/MedicalRecord");
const AppError_1 = require("../../shared/errors/AppError");
const mongoose_1 = __importDefault(require("mongoose"));
class MongoPrescriptionRepository {
    async findById(id) {
        const prescriptionDoc = await PrescriptionModel_1.PrescriptionModel.findById(id).exec();
        return prescriptionDoc ? this.toEntity(prescriptionDoc) : null;
    }
    async findByRecordId(recordId) {
        const prescriptionDocs = await PrescriptionModel_1.PrescriptionModel.find({ recordId })
            .sort({ datePrescribed: -1 })
            .exec();
        return prescriptionDocs.map(doc => this.toEntity(doc));
    }
    async findByMedicationName(medicationName) {
        const prescriptionDocs = await PrescriptionModel_1.PrescriptionModel.find({
            medicationName: { $regex: new RegExp(medicationName, 'i') }
        }).exec();
        return prescriptionDocs.map(doc => this.toEntity(doc));
    }
    async findByRefills(refills) {
        const prescriptionDocs = await PrescriptionModel_1.PrescriptionModel.find({ refills }).exec();
        return prescriptionDocs.map(doc => this.toEntity(doc));
    }
    async findByDateRange(startDate, endDate) {
        const prescriptionDocs = await PrescriptionModel_1.PrescriptionModel.find({
            datePrescribed: { $gte: startDate, $lte: endDate }
        }).exec();
        return prescriptionDocs.map(doc => this.toEntity(doc));
    }
    async findByStatus(status) {
        const prescriptionDocs = await PrescriptionModel_1.PrescriptionModel.find({ status }).exec();
        return prescriptionDocs.map(doc => this.toEntity(doc));
    }
    async findExpiringRefills(days = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() + days);
        const prescriptionDocs = await PrescriptionModel_1.PrescriptionModel.find({
            refills: { $gt: 0 },
            datePrescribed: { $lte: cutoffDate }
        }).exec();
        return prescriptionDocs.map(doc => this.toEntity(doc));
    }
    async findAll() {
        const prescriptionDocs = await PrescriptionModel_1.PrescriptionModel.find().exec();
        return prescriptionDocs.map(doc => this.toEntity(doc));
    }
    async exists(id) {
        const count = await PrescriptionModel_1.PrescriptionModel.countDocuments({ _id: id }).exec();
        return count > 0;
    }
    async getStats() {
        const totalPrescriptions = await PrescriptionModel_1.PrescriptionModel.countDocuments();
        const prescriptionsWithRefills = await PrescriptionModel_1.PrescriptionModel.countDocuments({ refills: { $gt: 0 } });
        const prescriptionsByRecordAgg = await PrescriptionModel_1.PrescriptionModel.aggregate([
            {
                $group: {
                    _id: '$recordId',
                    count: { $sum: 1 }
                }
            }
        ]);
        const mostPrescribedMedicationsAgg = await PrescriptionModel_1.PrescriptionModel.aggregate([
            {
                $group: {
                    _id: '$medicationName',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        const prescriptionsByStatusAgg = await PrescriptionModel_1.PrescriptionModel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const prescriptionsByRecord = {};
        prescriptionsByRecordAgg.forEach(item => {
            prescriptionsByRecord[item._id] = item.count;
        });
        const mostPrescribedMedications = mostPrescribedMedicationsAgg.map(item => ({
            medication: item._id,
            count: item.count
        }));
        const prescriptionsByStatus = {};
        prescriptionsByStatusAgg.forEach(item => {
            prescriptionsByStatus[item._id] = item.count;
        });
        return {
            totalPrescriptions,
            prescriptionsWithRefills,
            prescriptionsByRecord,
            mostPrescribedMedications,
            prescriptionsByStatus
        };
    }
    async save(prescription) {
        try {
            return await this.saveWithTransaction(prescription);
        }
        catch (error) {
            if (this.isTransactionError(error)) {
                console.warn('Transactions not supported, falling back to non-transactional prescription save');
                return await this.saveWithoutTransaction(prescription);
            }
            throw error;
        }
    }
    async saveWithTransaction(prescription) {
        const session = await mongoose_1.default.startSession();
        try {
            session.startTransaction();
            let savedPrescription;
            if (!prescription.id) {
                const prescriptionDoc = new PrescriptionModel_1.PrescriptionModel(this.toDocument(prescription));
                const savedDoc = await prescriptionDoc.save({ session });
                savedPrescription = this.toEntity(savedDoc);
                await MedicalRecord_1.MedicalRecordModel.findByIdAndUpdate(prescription.recordId, { $push: { prescriptions: savedDoc._id } }, { session, new: true }).exec();
            }
            else {
                const updatedDoc = await PrescriptionModel_1.PrescriptionModel.findByIdAndUpdate(prescription.id, this.toDocument(prescription), { new: true, runValidators: true, session }).exec();
                if (!updatedDoc) {
                    throw new Error(`Prescription with ID ${prescription.id} not found`);
                }
                savedPrescription = this.toEntity(updatedDoc);
            }
            await session.commitTransaction();
            session.endSession();
            return savedPrescription;
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    async saveWithoutTransaction(prescription) {
        try {
            let savedPrescription;
            if (!prescription.id) {
                const prescriptionDoc = new PrescriptionModel_1.PrescriptionModel(this.toDocument(prescription));
                const savedDoc = await prescriptionDoc.save();
                savedPrescription = this.toEntity(savedDoc);
                await MedicalRecord_1.MedicalRecordModel.findByIdAndUpdate(prescription.recordId, { $push: { prescriptions: savedDoc._id } }, { new: true }).exec();
            }
            else {
                const updatedDoc = await PrescriptionModel_1.PrescriptionModel.findByIdAndUpdate(prescription.id, this.toDocument(prescription), { new: true, runValidators: true }).exec();
                if (!updatedDoc) {
                    throw new Error(`Prescription with ID ${prescription.id} not found`);
                }
                savedPrescription = this.toEntity(updatedDoc);
            }
            return savedPrescription;
        }
        catch (error) {
            if (error instanceof Error) {
                throw new AppError_1.AppError(`Failed to save prescription: ${error.message}`, 'SAVE_ERROR', error);
            }
            throw new AppError_1.AppError('Failed to save prescription: Unknown error', 'SAVE_ERROR', error);
        }
    }
    async update(prescription) {
        await PrescriptionModel_1.PrescriptionModel.findByIdAndUpdate(prescription.id, this.toDocument(prescription), { new: true, runValidators: true }).exec();
    }
    async updateById(id, updateData) {
        const updateQuery = {};
        if (updateData.recordId !== undefined)
            updateQuery.recordId = updateData.recordId;
        if (updateData.medicationName !== undefined)
            updateQuery.medicationName = updateData.medicationName;
        if (updateData.dosage !== undefined)
            updateQuery.dosage = updateData.dosage;
        if (updateData.instructions !== undefined)
            updateQuery.instructions = updateData.instructions;
        if (updateData.refills !== undefined)
            updateQuery.refills = updateData.refills;
        if (updateData.datePrescribed !== undefined)
            updateQuery.datePrescribed = updateData.datePrescribed;
        if (updateData.filledDate !== undefined)
            updateQuery.filledDate = updateData.filledDate;
        if (updateData.filledBy !== undefined)
            updateQuery.filledBy = updateData.filledBy;
        if (updateData.status !== undefined)
            updateQuery.status = updateData.status;
        await PrescriptionModel_1.PrescriptionModel.findByIdAndUpdate(id, updateQuery, { new: true, runValidators: true }).exec();
    }
    async delete(id) {
        try {
            return await this.deleteWithTransaction(id);
        }
        catch (error) {
            if (this.isTransactionError(error)) {
                console.warn('Transactions not supported, falling back to non-transactional prescription delete');
                return await this.deleteWithoutTransaction(id);
            }
            throw error;
        }
    }
    async deleteWithTransaction(id) {
        const session = await mongoose_1.default.startSession();
        try {
            session.startTransaction();
            const prescription = await PrescriptionModel_1.PrescriptionModel.findById(id).session(session);
            if (!prescription) {
                throw new Error(`Prescription with ID ${id} not found`);
            }
            await PrescriptionModel_1.PrescriptionModel.findByIdAndDelete(id).session(session);
            await MedicalRecord_1.MedicalRecordModel.findByIdAndUpdate(prescription.recordId, { $pull: { prescriptions: id } }, { session, new: true }).exec();
            await session.commitTransaction();
            session.endSession();
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    async deleteWithoutTransaction(id) {
        try {
            const prescription = await PrescriptionModel_1.PrescriptionModel.findById(id);
            if (!prescription) {
                throw new Error(`Prescription with ID ${id} not found`);
            }
            await PrescriptionModel_1.PrescriptionModel.findByIdAndDelete(id);
            await MedicalRecord_1.MedicalRecordModel.findByIdAndUpdate(prescription.recordId, { $pull: { prescriptions: id } }, { new: true }).exec();
        }
        catch (error) {
            if (error instanceof Error) {
                throw new AppError_1.AppError(`Failed to delete prescription: ${error.message}`, 'DELETE_ERROR', error);
            }
            throw new AppError_1.AppError('Failed to delete prescription: Unknown error', 'DELETE_ERROR', error);
        }
    }
    async search(query) {
        const prescriptionDocs = await PrescriptionModel_1.PrescriptionModel.find({
            $or: [
                { medicationName: { $regex: new RegExp(query, 'i') } },
                { dosage: { $regex: new RegExp(query, 'i') } },
                { instructions: { $regex: new RegExp(query, 'i') } }
            ]
        }).exec();
        return prescriptionDocs.map(doc => this.toEntity(doc));
    }
    async getPrescriptionStats() {
        const total = await PrescriptionModel_1.PrescriptionModel.countDocuments();
        const withRefills = await PrescriptionModel_1.PrescriptionModel.countDocuments({ refills: { $gt: 0 } });
        const byRecordAgg = await PrescriptionModel_1.PrescriptionModel.aggregate([
            {
                $group: {
                    _id: '$recordId',
                    count: { $sum: 1 }
                }
            }
        ]);
        const topMedicationsAgg = await PrescriptionModel_1.PrescriptionModel.aggregate([
            {
                $group: {
                    _id: '$medicationName',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        const refillDistributionAgg = await PrescriptionModel_1.PrescriptionModel.aggregate([
            {
                $group: {
                    _id: '$refills',
                    count: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);
        const byStatusAgg = await PrescriptionModel_1.PrescriptionModel.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);
        const byRecord = {};
        byRecordAgg.forEach(item => {
            byRecord[item._id] = item.count;
        });
        const topMedications = topMedicationsAgg.map(item => ({
            medication: item._id,
            count: item.count
        }));
        const refillDistribution = refillDistributionAgg.map(item => ({
            refills: item._id,
            count: item.count
        }));
        const byStatus = {};
        byStatusAgg.forEach(item => {
            byStatus[item._id] = item.count;
        });
        return {
            total,
            withRefills,
            byRecord,
            topMedications,
            refillDistribution,
            byStatus
        };
    }
    async decrementRefill(id) {
        await PrescriptionModel_1.PrescriptionModel.findByIdAndUpdate(id, { $inc: { refills: -1 } }, { new: true, runValidators: true }).exec();
    }
    async bulkUpdateRefills(ids, refills) {
        await PrescriptionModel_1.PrescriptionModel.updateMany({ _id: { $in: ids } }, { refills }, { runValidators: true }).exec();
    }
    async markAsFilled(id, filledDate, filledBy) {
        await PrescriptionModel_1.PrescriptionModel.findByIdAndUpdate(id, {
            filledDate,
            filledBy,
            status: 'filled'
        }, { new: true, runValidators: true }).exec();
    }
    isTransactionError(error) {
        if (error instanceof Error) {
            return error.message.includes('Transaction numbers are only allowed') ||
                error.message.includes('replica set') ||
                error.message.includes('IllegalOperation');
        }
        return false;
    }
    toEntity(doc) {
        return Prescription_1.Prescription.create({
            id: doc._id.toString(),
            recordId: doc.recordId,
            medicationName: doc.medicationName,
            dosage: doc.dosage,
            instructions: doc.instructions,
            datePrescribed: doc.datePrescribed,
            refills: doc.refills,
            filledDate: doc.filledDate,
            filledBy: doc.filledBy,
            status: doc.status,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt
        });
    }
    toDocument(prescription) {
        return {
            recordId: prescription.recordId,
            medicationName: prescription.medicationName,
            dosage: prescription.dosage,
            instructions: prescription.instructions,
            datePrescribed: prescription.datePrescribed,
            refills: prescription.refills,
            filledDate: prescription.filledDate,
            filledBy: prescription.filledBy,
            status: prescription.status,
            createdAt: prescription.createdAt,
            updatedAt: prescription.updatedAt
        };
    }
}
exports.MongoPrescriptionRepository = MongoPrescriptionRepository;
//# sourceMappingURL=MongoPrescriptionRepository.js.map