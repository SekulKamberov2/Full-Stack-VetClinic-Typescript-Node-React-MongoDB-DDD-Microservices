"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MongoMedicalRecordRepository = void 0;
const MedicalRecord_1 = require("../../domain/entities/MedicalRecord");
const MedicalRecord_2 = require("./models/MedicalRecord");
const Diagnosis_1 = require("../../domain/entities/Diagnosis");
const Treatment_1 = require("../../domain/entities/Treatment");
const Prescription_1 = require("../../domain/entities/Prescription");
const PrescriptionModel_1 = require("./models/PrescriptionModel");
const DiagnosisModel_1 = require("./models/DiagnosisModel");
const TreatmentModel_1 = require("./models/TreatmentModel");
const mongoose_1 = __importDefault(require("mongoose"));
const AppError_1 = require("../../shared/errors/AppError");
class MongoMedicalRecordRepository {
    constructor(eventPublisher) {
        this.eventPublisher = eventPublisher;
    }
    isValidObjectId(id) {
        if (!id || id.trim() === '') {
            return false;
        }
        return mongoose_1.default.Types.ObjectId.isValid(id);
    }
    filterValidIds(ids) {
        return ids
            .filter(id => id !== null && id !== undefined)
            .map(id => id.toString())
            .filter(id => this.isValidObjectId(id));
    }
    async findById(id) {
        try {
            if (!this.isValidObjectId(id))
                return null;
            const recordDoc = await MedicalRecord_2.MedicalRecordModel.findById(id)
                .populate({
                path: 'diagnoses',
                model: DiagnosisModel_1.DiagnosisModel
            })
                .populate({
                path: 'treatments',
                model: TreatmentModel_1.TreatmentModel
            })
                .populate({
                path: 'prescriptions',
                model: PrescriptionModel_1.PrescriptionModel
            })
                .exec();
            return recordDoc ? this.toDomain(recordDoc) : null;
        }
        catch (error) {
            throw new AppError_1.AppError(`Failed to find medical record by ID: ${id}`, 'FIND_BY_ID_ERROR', error);
        }
    }
    async findByPatientId(patientId) {
        try {
            const recordDocs = await MedicalRecord_2.MedicalRecordModel.find({ patientId })
                .populate({
                path: 'diagnoses',
                model: DiagnosisModel_1.DiagnosisModel
            })
                .populate({
                path: 'treatments',
                model: TreatmentModel_1.TreatmentModel
            })
                .populate({
                path: 'prescriptions',
                model: PrescriptionModel_1.PrescriptionModel
            })
                .exec();
            return recordDocs.map((doc) => this.toDomain(doc));
        }
        catch (error) {
            throw new AppError_1.AppError(`Failed to find medical records by patient ID: ${patientId}`, 'FIND_BY_PATIENT_ERROR', error);
        }
    }
    async findByClientId(clientId) {
        try {
            const recordDocs = await MedicalRecord_2.MedicalRecordModel.find({ clientId })
                .populate('diagnoses')
                .populate('treatments')
                .populate('prescriptions')
                .exec();
            return recordDocs.map((doc) => this.toDomain(doc));
        }
        catch (error) {
            throw new AppError_1.AppError(`Failed to find medical records by client ID: ${clientId}`, 'FIND_BY_CLIENT_ERROR', error);
        }
    }
    async findByVeterinarianId(veterinarianId) {
        try {
            const recordDocs = await MedicalRecord_2.MedicalRecordModel.find({ veterinarianId })
                .populate('diagnoses')
                .populate('treatments')
                .populate('prescriptions')
                .exec();
            return recordDocs.map((doc) => this.toDomain(doc));
        }
        catch (error) {
            throw new AppError_1.AppError(`Failed to find medical records by veterinarian ID: ${veterinarianId}`, 'FIND_BY_VETERINARIAN_ERROR', error);
        }
    }
    async findByAppointmentId(appointmentId) {
        try {
            const recordDoc = await MedicalRecord_2.MedicalRecordModel.findOne({ appointmentId })
                .populate('diagnoses')
                .populate('treatments')
                .populate('prescriptions')
                .exec();
            return recordDoc ? this.toDomain(recordDoc) : null;
        }
        catch (error) {
            throw new AppError_1.AppError(`Failed to find medical record by appointment ID: ${appointmentId}`, 'FIND_BY_APPOINTMENT_ERROR', error);
        }
    }
    async save(record) {
        try {
            return await this.saveWithTransaction(record);
        }
        catch (error) {
            if (this.isTransactionError(error)) {
                console.warn('Transactions not supported, falling back to non-transactional save');
                return await this.saveWithoutTransaction(record);
            }
            throw error;
        }
    }
    async saveWithTransaction(record) {
        const session = await mongoose_1.default.startSession();
        session.startTransaction();
        try {
            const recordData = this.toPersistence(record);
            let savedRecord;
            if (!record.id) {
                const createdRecords = await MedicalRecord_2.MedicalRecordModel.create([recordData], { session });
                savedRecord = createdRecords[0];
            }
            else {
                savedRecord = await MedicalRecord_2.MedicalRecordModel.findOneAndUpdate({ _id: record.id }, { $set: recordData }, { upsert: true, new: true, session }).exec();
                if (!savedRecord) {
                    throw new AppError_1.NotFoundError(`Medical record with id ${record.id} not found`);
                }
            }
            const generatedRecordId = savedRecord._id.toString();
            for (const diagnosis of record.diagnoses) {
                const diagnosisData = {
                    ...this.diagnosisToPersistence(diagnosis),
                    recordId: generatedRecordId
                };
                if (!diagnosis.id) {
                    const newDiagnoses = await DiagnosisModel_1.DiagnosisModel.create([diagnosisData], { session });
                    const newDiagnosis = newDiagnoses[0];
                    if (typeof diagnosis.setId === 'function') {
                        diagnosis.setId(newDiagnosis._id.toString());
                    }
                }
                else {
                    await DiagnosisModel_1.DiagnosisModel.findOneAndUpdate({ _id: diagnosis.id }, diagnosisData, { upsert: true, new: true, session }).exec();
                }
            }
            for (const treatment of record.treatments) {
                const treatmentData = {
                    ...this.treatmentToPersistence(treatment),
                    recordId: generatedRecordId
                };
                if (!treatment.id) {
                    const newTreatments = await TreatmentModel_1.TreatmentModel.create([treatmentData], { session });
                    const newTreatment = newTreatments[0];
                    if (typeof treatment.setId === 'function') {
                        treatment.setId(newTreatment._id.toString());
                    }
                }
                else {
                    await TreatmentModel_1.TreatmentModel.findOneAndUpdate({ _id: treatment.id }, treatmentData, { upsert: true, new: true, session }).exec();
                }
            }
            for (const prescription of record.prescriptions) {
                const prescriptionData = {
                    ...this.prescriptionToPersistence(prescription),
                    recordId: generatedRecordId
                };
                if (!prescription.id) {
                    const newPrescriptions = await PrescriptionModel_1.PrescriptionModel.create([prescriptionData], { session });
                    const newPrescription = newPrescriptions[0];
                    if (typeof prescription.setId === 'function') {
                        prescription.setId(newPrescription._id.toString());
                    }
                }
                else {
                    await PrescriptionModel_1.PrescriptionModel.findOneAndUpdate({ _id: prescription.id }, prescriptionData, { upsert: true, new: true, session }).exec();
                }
            }
            await session.commitTransaction();
            session.endSession();
            const savedEntity = this.toDomain(savedRecord);
            for (const event of record.domainEvents) {
                await this.eventPublisher.publish(event);
            }
            record.clearEvents();
            return savedEntity;
        }
        catch (error) {
            await session.abortTransaction();
            session.endSession();
            throw error;
        }
    }
    async saveWithoutTransaction(record) {
        try {
            const recordData = this.toPersistence(record);
            let savedRecord;
            if (!record.id) {
                const createdRecords = await MedicalRecord_2.MedicalRecordModel.create([recordData]);
                savedRecord = createdRecords[0];
            }
            else {
                savedRecord = await MedicalRecord_2.MedicalRecordModel.findOneAndUpdate({ _id: record.id }, { $set: recordData }, { upsert: true, new: true }).exec();
                if (!savedRecord) {
                    throw new AppError_1.NotFoundError(`Medical record with id ${record.id} not found`);
                }
            }
            const generatedRecordId = savedRecord._id.toString();
            const diagnosisIds = [];
            const treatmentIds = [];
            const prescriptionIds = [];
            for (const diagnosis of record.diagnoses) {
                const diagnosisData = {
                    ...this.diagnosisToPersistence(diagnosis),
                    recordId: generatedRecordId
                };
                if (!diagnosis.id) {
                    const newDiagnoses = await DiagnosisModel_1.DiagnosisModel.create([diagnosisData]);
                    const newDiagnosis = newDiagnoses[0];
                    diagnosisIds.push(newDiagnosis._id.toString());
                    if (typeof diagnosis.setId === 'function') {
                        diagnosis.setId(newDiagnosis._id.toString());
                    }
                }
                else {
                    await DiagnosisModel_1.DiagnosisModel.findOneAndUpdate({ _id: diagnosis.id }, diagnosisData, { upsert: true, new: true }).exec();
                    diagnosisIds.push(diagnosis.id);
                }
            }
            for (const treatment of record.treatments) {
                const treatmentData = {
                    ...this.treatmentToPersistence(treatment),
                    recordId: generatedRecordId
                };
                if (!treatment.id) {
                    const newTreatments = await TreatmentModel_1.TreatmentModel.create([treatmentData]);
                    const newTreatment = newTreatments[0];
                    treatmentIds.push(newTreatment._id.toString());
                    if (typeof treatment.setId === 'function') {
                        treatment.setId(newTreatment._id.toString());
                    }
                }
                else {
                    await TreatmentModel_1.TreatmentModel.findOneAndUpdate({ _id: treatment.id }, treatmentData, { upsert: true, new: true }).exec();
                    treatmentIds.push(treatment.id);
                }
            }
            for (const prescription of record.prescriptions) {
                const prescriptionData = {
                    ...this.prescriptionToPersistence(prescription),
                    recordId: generatedRecordId
                };
                if (!prescription.id) {
                    const newPrescriptions = await PrescriptionModel_1.PrescriptionModel.create([prescriptionData]);
                    const newPrescription = newPrescriptions[0];
                    prescriptionIds.push(newPrescription._id.toString());
                    if (typeof prescription.setId === 'function') {
                        prescription.setId(newPrescription._id.toString());
                    }
                }
                else {
                    await PrescriptionModel_1.PrescriptionModel.findOneAndUpdate({ _id: prescription.id }, prescriptionData, { upsert: true, new: true }).exec();
                    prescriptionIds.push(prescription.id);
                }
            }
            const updatedRecord = await MedicalRecord_2.MedicalRecordModel.findByIdAndUpdate(generatedRecordId, {
                $set: {
                    diagnoses: diagnosisIds,
                    treatments: treatmentIds,
                    prescriptions: prescriptionIds
                }
            }, { new: true })
                .populate('diagnoses')
                .populate('treatments')
                .populate('prescriptions')
                .exec();
            if (!updatedRecord) {
                throw new AppError_1.NotFoundError(`Medical record with id ${generatedRecordId} not found after update`);
            }
            const savedEntity = this.toDomain(updatedRecord);
            for (const event of record.domainEvents) {
                await this.eventPublisher.publish(event);
            }
            record.clearEvents();
            return savedEntity;
        }
        catch (error) {
            AppError_1.ErrorHandler.handleAppError(error, 'Saving medical record (non-transactional)');
        }
    }
    isTransactionError(error) {
        if (error instanceof Error) {
            return error.message.includes('Transaction numbers are only allowed') ||
                error.message.includes('replica set') ||
                error.message.includes('IllegalOperation');
        }
        return false;
    }
    async findAll(skip = 0, limit = 50, filters = {}) {
        try {
            const query = {};
            if (filters.patientId)
                query.patientId = filters.patientId;
            if (filters.clientId)
                query.clientId = filters.clientId;
            if (filters.veterinarianId)
                query.veterinarianId = filters.veterinarianId;
            if (filters.dateFrom || filters.dateTo) {
                query.date = {};
                if (filters.dateFrom)
                    query.date.$gte = filters.dateFrom;
                if (filters.dateTo)
                    query.date.$lte = filters.dateTo;
            }
            const [recordDocs, totalCount] = await Promise.all([
                MedicalRecord_2.MedicalRecordModel.find(query)
                    .populate('diagnoses')
                    .populate('treatments')
                    .populate('prescriptions')
                    .sort({ date: -1 })
                    .skip(skip)
                    .limit(limit)
                    .exec(),
                MedicalRecord_2.MedicalRecordModel.countDocuments(query).exec(),
            ]);
            const records = recordDocs.map((doc) => this.toDomain(doc));
            return { records, totalCount };
        }
        catch (error) {
            throw new AppError_1.AppError('Failed to find all medical records', 'FIND_ALL_ERROR', error);
        }
    }
    async exists(id) {
        try {
            if (!this.isValidObjectId(id))
                return false;
            const count = await MedicalRecord_2.MedicalRecordModel.countDocuments({ _id: id }).exec();
            return count > 0;
        }
        catch (error) {
            throw new AppError_1.AppError(`Failed to check if medical record exists: ${id}`, 'EXISTS_ERROR', error);
        }
    }
    async delete(id) {
        try {
            if (!this.isValidObjectId(id))
                return false;
            const record = await MedicalRecord_2.MedicalRecordModel.findById(id);
            if (!record) {
                return false;
            }
            await Promise.all([
                DiagnosisModel_1.DiagnosisModel.deleteMany({ _id: { $in: record.diagnoses } }),
                TreatmentModel_1.TreatmentModel.deleteMany({ _id: { $in: record.treatments } }),
                PrescriptionModel_1.PrescriptionModel.deleteMany({ _id: { $in: record.prescriptions } }),
            ]);
            const result = await MedicalRecord_2.MedicalRecordModel.deleteOne({ _id: id });
            return result.deletedCount > 0;
        }
        catch (error) {
            throw new AppError_1.AppError(`Failed to delete medical record: ${id}`, 'DELETE_ERROR', error);
        }
    }
    async cleanupCorruptedData() {
        try {
            const records = await MedicalRecord_2.MedicalRecordModel.find({
                $or: [
                    { diagnoses: "" },
                    { treatments: "" },
                    { prescriptions: "" },
                    { diagnoses: { $exists: true, $type: "string" } },
                    { treatments: { $exists: true, $type: "string" } },
                    { prescriptions: { $exists: true, $type: "string" } }
                ]
            });
            for (const record of records) {
                const updates = {};
                if (Array.isArray(record.diagnoses)) {
                    updates.diagnoses = this.filterValidIds(record.diagnoses);
                }
                if (Array.isArray(record.treatments)) {
                    updates.treatments = this.filterValidIds(record.treatments);
                }
                if (Array.isArray(record.prescriptions)) {
                    updates.prescriptions = this.filterValidIds(record.prescriptions);
                }
                if (Object.keys(updates).length > 0) {
                    await MedicalRecord_2.MedicalRecordModel.updateOne({ _id: record._id }, { $set: updates });
                }
            }
            console.log('Database cleanup completed: Removed invalid IDs from medical records');
        }
        catch (error) {
            throw new AppError_1.AppError('Failed to cleanup corrupted data', 'CLEANUP_ERROR', error);
        }
    }
    toDomain(doc) {
        const diagnoses = Array.isArray(doc.diagnoses)
            ? doc.diagnoses.map((d) => {
                if (typeof d === 'string') {
                    return Diagnosis_1.Diagnosis.create({
                        id: d,
                        recordId: doc._id.toString(),
                        description: '',
                        date: new Date()
                    });
                }
                else {
                    return Diagnosis_1.Diagnosis.create({
                        id: d._id.toString(),
                        recordId: d.recordId || doc._id.toString(),
                        description: d.description,
                        date: d.date,
                        notes: d.notes,
                    });
                }
            })
            : [];
        const treatments = Array.isArray(doc.treatments)
            ? doc.treatments.map((t) => {
                if (typeof t === 'string') {
                    return Treatment_1.Treatment.create({
                        id: t,
                        recordId: doc._id.toString(),
                        name: '',
                        description: '',
                        cost: 0,
                        date: new Date()
                    });
                }
                else {
                    return Treatment_1.Treatment.create({
                        id: t._id.toString(),
                        recordId: t.recordId || doc._id.toString(),
                        name: t.name,
                        description: t.description,
                        date: t.date,
                        cost: t.cost,
                    });
                }
            })
            : [];
        const prescriptions = Array.isArray(doc.prescriptions)
            ? doc.prescriptions.map((p) => {
                if (typeof p === 'string') {
                    return Prescription_1.Prescription.create({
                        id: p,
                        recordId: doc._id.toString(),
                        medicationName: '',
                        dosage: '',
                        instructions: '',
                        refills: 0,
                        datePrescribed: new Date()
                    });
                }
                else {
                    return Prescription_1.Prescription.create({
                        id: p._id.toString(),
                        recordId: p.recordId || doc._id.toString(),
                        medicationName: p.medicationName,
                        dosage: p.dosage,
                        instructions: p.instructions,
                        datePrescribed: p.datePrescribed,
                        refills: p.refills,
                        filledDate: p.filledDate,
                        filledBy: p.filledBy,
                        status: p.status,
                    });
                }
            })
            : [];
        const record = new MedicalRecord_1.MedicalRecord({
            id: doc._id.toString(),
            patientId: doc.patientId,
            clientId: doc.clientId,
            veterinarianId: doc.veterinarianId,
            appointmentId: doc.appointmentId,
            notes: doc.notes,
            diagnoses: diagnoses,
            treatments: treatments,
            prescriptions: prescriptions,
            createdAt: doc.createdAt,
            updatedAt: doc.updatedAt,
        });
        record.clearEvents();
        return record;
    }
    toPersistence(record) {
        const validDiagnosisIds = record.diagnoses
            .filter(d => d.id && d.id.trim() !== '')
            .map(d => d.id);
        const validTreatmentIds = record.treatments
            .filter(t => t.id && t.id.trim() !== '')
            .map(t => t.id);
        const validPrescriptionIds = record.prescriptions
            .filter(p => p.id && p.id.trim() !== '')
            .map(p => p.id);
        return {
            patientId: record.patientId,
            clientId: record.clientId,
            veterinarianId: record.veterinarianId,
            appointmentId: record.appointmentId,
            notes: record.notes,
            diagnoses: validDiagnosisIds,
            treatments: validTreatmentIds,
            prescriptions: validPrescriptionIds,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        };
    }
    diagnosisToPersistence(diagnosis) {
        return {
            recordId: diagnosis.recordId,
            description: diagnosis.description,
            date: diagnosis.date,
            notes: diagnosis.notes,
        };
    }
    treatmentToPersistence(treatment) {
        return {
            recordId: treatment.recordId,
            name: treatment.name,
            description: treatment.description,
            date: treatment.date,
            cost: treatment.cost,
        };
    }
    prescriptionToPersistence(prescription) {
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
        };
    }
}
exports.MongoMedicalRecordRepository = MongoMedicalRecordRepository;
//# sourceMappingURL=MongoMedicalRecordRepository.js.map