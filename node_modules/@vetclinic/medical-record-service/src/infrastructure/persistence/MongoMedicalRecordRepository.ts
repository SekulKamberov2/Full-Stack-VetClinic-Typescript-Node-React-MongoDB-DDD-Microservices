import { MedicalRecord } from "../../domain/entities/MedicalRecord";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";
import { EventPublisher } from "../../shared/domain/EventPublisher";  
import { MedicalRecordModel } from "./models/MedicalRecord";  
import { Diagnosis } from "../../domain/entities/Diagnosis";
import { Treatment } from "../../domain/entities/Treatment";
import { Prescription } from "../../domain/entities/Prescription";
import { PrescriptionModel } from "./models/PrescriptionModel";
import { DiagnosisModel } from "./models/DiagnosisModel";
import { TreatmentModel } from "./models/TreatmentModel";
import mongoose from "mongoose";
import { ErrorHandler, NotFoundError, ValidationError } from "@vetclinic/shared-kernel";

export class MongoMedicalRecordRepository implements MedicalRecordRepository {
  constructor(private eventPublisher: EventPublisher) {}

  private isValidObjectId(id: string): boolean {
    if (!id || id.trim() === '') {
      return false;
    }
    return mongoose.Types.ObjectId.isValid(id);
  }

  private validateId(id: string): void {
    if (!this.isValidObjectId(id)) {
      throw new ValidationError("Invalid ID format", undefined, 'MedicalRecord repository');
    }
  }

  private filterValidIds(ids: any[]): string[] {
    return ids
      .filter(id => id !== null && id !== undefined)
      .map(id => id.toString())
      .filter(id => this.isValidObjectId(id));
  }

  async findById(id: string): Promise<MedicalRecord | null> {
    try {
      this.validateId(id);
      
      const recordDoc = await MedicalRecordModel.findById(id)
        .populate({
          path: 'diagnoses',
          model: DiagnosisModel
        })
        .populate({
          path: 'treatments', 
          model: TreatmentModel
        })
        .populate({
          path: 'prescriptions',
          model: PrescriptionModel
        })
        .exec();
        
      return recordDoc ? this.toDomain(recordDoc) : null;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findById');
    }
  }

  async findByPatientId(patientId: string): Promise<MedicalRecord[]> {
    try {
      if (!patientId || patientId.trim() === '') {
        throw new ValidationError("Patient ID is required", undefined, 'MedicalRecord repository');
      }

      const recordDocs = await MedicalRecordModel.find({ patientId })
        .populate({
          path: 'diagnoses',
          model: DiagnosisModel
        })
        .populate({
          path: 'treatments',
          model: TreatmentModel
        })
        .populate({
          path: 'prescriptions', 
          model: PrescriptionModel
        })
        .exec();
        
      return recordDocs.map((doc) => this.toDomain(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByPatientId');
    }
  } 

  async findByClientId(clientId: string): Promise<MedicalRecord[]> {
    try {
      if (!clientId || clientId.trim() === '') {
        throw new ValidationError("Client ID is required", undefined, 'MedicalRecord repository');
      }

      const recordDocs = await MedicalRecordModel.find({ clientId })
        .populate('diagnoses')
        .populate('treatments')
        .populate('prescriptions')
        .exec();
        
      return recordDocs.map((doc) => this.toDomain(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByClientId');
    }
  }

  async findByVeterinarianId(veterinarianId: string): Promise<MedicalRecord[]> {
    try {
      if (!veterinarianId || veterinarianId.trim() === '') {
        throw new ValidationError("Veterinarian ID is required", undefined, 'MedicalRecord repository');
      }

      const recordDocs = await MedicalRecordModel.find({ veterinarianId })
        .populate('diagnoses')
        .populate('treatments')
        .populate('prescriptions')
        .exec();
        
      return recordDocs.map((doc) => this.toDomain(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByVeterinarianId');
    }
  }

  async findByAppointmentId(appointmentId: string): Promise<MedicalRecord | null> {
    try {
      if (!appointmentId || appointmentId.trim() === '') {
        throw new ValidationError("Appointment ID is required", undefined, 'MedicalRecord repository');
      }

      const recordDoc = await MedicalRecordModel.findOne({ appointmentId })
        .populate('diagnoses')
        .populate('treatments')
        .populate('prescriptions')
        .exec();
        
      return recordDoc ? this.toDomain(recordDoc) : null;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByAppointmentId');
    }
  }

  async save(record: MedicalRecord): Promise<MedicalRecord> {
    try { 
      return await this.saveWithTransaction(record);
    } catch (error) { 
      if (this.isTransactionError(error)) {
        console.warn('Transactions not supported, falling back to non-transactional save');
        return await this.saveWithoutTransaction(record);
      } 
      ErrorHandler.handleAppError(error, 'save');
    }
  }

  private async saveWithTransaction(record: MedicalRecord): Promise<MedicalRecord> {
    const session = await mongoose.startSession();
    session.startTransaction(); 
    try {
      const recordData = this.toPersistence(record); 
      let savedRecord;
      
      if (!record.id) {
        const createdRecords = await MedicalRecordModel.create([recordData], { session });
        savedRecord = createdRecords[0];
      } else {
        savedRecord = await MedicalRecordModel.findOneAndUpdate(
          { _id: record.id },
          { $set: recordData },
          { upsert: true, new: true, session }
        ).exec();
        
        if (!savedRecord) {
          throw new NotFoundError(`Medical record with id ${record.id} not found`);
        }
      }

      const generatedRecordId = savedRecord._id.toString();
  
      for (const diagnosis of record.diagnoses) {
        const diagnosisData = {
          ...this.diagnosisToPersistence(diagnosis),
          recordId: generatedRecordId
        };
        
        if (!diagnosis.id) {
          const newDiagnoses = await DiagnosisModel.create([diagnosisData], { session });
          const newDiagnosis = newDiagnoses[0];
          if (typeof (diagnosis as any).setId === 'function') {
            (diagnosis as any).setId(newDiagnosis._id.toString());
          }
        } else {
          await DiagnosisModel.findOneAndUpdate(
            { _id: diagnosis.id },
            diagnosisData,
            { upsert: true, new: true, session }
          ).exec();
        }
      }
  
      for (const treatment of record.treatments) {
        const treatmentData = {
          ...this.treatmentToPersistence(treatment),
          recordId: generatedRecordId
        };
        
        if (!treatment.id) {
          const newTreatments = await TreatmentModel.create([treatmentData], { session });
          const newTreatment = newTreatments[0];
          if (typeof (treatment as any).setId === 'function') {
            (treatment as any).setId(newTreatment._id.toString());
          }
        } else {
          await TreatmentModel.findOneAndUpdate(
            { _id: treatment.id },
            treatmentData,
            { upsert: true, new: true, session }
          ).exec();
        }
      }
  
      for (const prescription of record.prescriptions) {
        const prescriptionData = {
          ...this.prescriptionToPersistence(prescription),
          recordId: generatedRecordId
        };
        
        if (!prescription.id) {
          const newPrescriptions = await PrescriptionModel.create([prescriptionData], { session });
          const newPrescription = newPrescriptions[0];
          if (typeof (prescription as any).setId === 'function') {
            (prescription as any).setId(newPrescription._id.toString());
          }
        } else {
          await PrescriptionModel.findOneAndUpdate(
            { _id: prescription.id },
            prescriptionData,
            { upsert: true, new: true, session }
          ).exec();
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
      
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      ErrorHandler.handleAppError(error, 'saveWithTransaction');
    }
  }

  private async saveWithoutTransaction(record: MedicalRecord): Promise<MedicalRecord> {
    try {
      const recordData = this.toPersistence(record);
      
      let savedRecord;
      
      if (!record.id) {
        const createdRecords = await MedicalRecordModel.create([recordData]);
        savedRecord = createdRecords[0];
      } else {
        savedRecord = await MedicalRecordModel.findOneAndUpdate(
          { _id: record.id },
          { $set: recordData },
          { upsert: true, new: true }
        ).exec();
        
        if (!savedRecord) {
          throw new NotFoundError(`Medical record with id ${record.id} not found`);
        }
      }

      const generatedRecordId = savedRecord._id.toString();
      const diagnosisIds: string[] = [];
      const treatmentIds: string[] = [];
      const prescriptionIds: string[] = [];
  
      for (const diagnosis of record.diagnoses) {
        const diagnosisData = {
          ...this.diagnosisToPersistence(diagnosis),
          recordId: generatedRecordId
        };
        
        if (!diagnosis.id) {
          const newDiagnoses = await DiagnosisModel.create([diagnosisData]);
          const newDiagnosis = newDiagnoses[0];
          diagnosisIds.push(newDiagnosis._id.toString());
          if (typeof (diagnosis as any).setId === 'function') {
            (diagnosis as any).setId(newDiagnosis._id.toString());
          }
        } else {
          await DiagnosisModel.findOneAndUpdate(
            { _id: diagnosis.id },
            diagnosisData,
            { upsert: true, new: true }
          ).exec();
          diagnosisIds.push(diagnosis.id);
        }
      }
  
      for (const treatment of record.treatments) {
        const treatmentData = {
          ...this.treatmentToPersistence(treatment),
          recordId: generatedRecordId
        };
        
        if (!treatment.id) {
          const newTreatments = await TreatmentModel.create([treatmentData]);
          const newTreatment = newTreatments[0];
          treatmentIds.push(newTreatment._id.toString());
          if (typeof (treatment as any).setId === 'function') {
            (treatment as any).setId(newTreatment._id.toString());
          }
        } else {
          await TreatmentModel.findOneAndUpdate(
            { _id: treatment.id },
            treatmentData,
            { upsert: true, new: true }
          ).exec();
          treatmentIds.push(treatment.id);
        }
      }
  
      for (const prescription of record.prescriptions) {
        const prescriptionData = {
          ...this.prescriptionToPersistence(prescription),
          recordId: generatedRecordId
        };
        
        if (!prescription.id) {
          const newPrescriptions = await PrescriptionModel.create([prescriptionData]);
          const newPrescription = newPrescriptions[0];
          prescriptionIds.push(newPrescription._id.toString());
          if (typeof (prescription as any).setId === 'function') {
            (prescription as any).setId(newPrescription._id.toString());
          }
        } else {
          await PrescriptionModel.findOneAndUpdate(
            { _id: prescription.id },
            prescriptionData,
            { upsert: true, new: true }
          ).exec();
          prescriptionIds.push(prescription.id);
        }
      }
  
      const updatedRecord = await MedicalRecordModel.findByIdAndUpdate(
        generatedRecordId,
        { 
          $set: { 
            diagnoses: diagnosisIds,
            treatments: treatmentIds, 
            prescriptions: prescriptionIds
          } 
        },
        { new: true }
      )
      .populate('diagnoses')
      .populate('treatments')
      .populate('prescriptions')
      .exec();

      if (!updatedRecord) {
        throw new NotFoundError(`Medical record with id ${generatedRecordId} not found after update`);
      }

      const savedEntity = this.toDomain(updatedRecord);
      
      for (const event of record.domainEvents) {
        await this.eventPublisher.publish(event);
      }
      record.clearEvents();

      return savedEntity;
      
    } catch (error) {
      ErrorHandler.handleAppError(error, 'saveWithoutTransaction');
    }
  }

  private isTransactionError(error: unknown): boolean {
    if (error instanceof Error) {
      return error.message.includes('Transaction numbers are only allowed') ||
            error.message.includes('replica set') ||
            error.message.includes('IllegalOperation');
    }
    return false;
  }

  async findAll(
    skip: number = 0,
    limit: number = 50,
    filters: {
      patientId?: string;
      clientId?: string;
      veterinarianId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    } = {}
  ): Promise<{ records: MedicalRecord[]; totalCount: number }> {
    try {
      const query: any = {};

      if (filters.patientId) query.patientId = filters.patientId;
      if (filters.clientId) query.clientId = filters.clientId;
      if (filters.veterinarianId) query.veterinarianId = filters.veterinarianId;
      if (filters.dateFrom || filters.dateTo) {
        query.date = {};
        if (filters.dateFrom) query.date.$gte = filters.dateFrom;
        if (filters.dateTo) query.date.$lte = filters.dateTo;
      }

      const [recordDocs, totalCount] = await Promise.all([
        MedicalRecordModel.find(query)
          .populate('diagnoses')
          .populate('treatments')
          .populate('prescriptions')
          .sort({ date: -1 })
          .skip(skip)
          .limit(limit)
          .exec(),
        MedicalRecordModel.countDocuments(query).exec(),
      ]);

      const records = recordDocs.map((doc) => this.toDomain(doc));
      return { records, totalCount };
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findAll');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      this.validateId(id);
      const count = await MedicalRecordModel.countDocuments({ _id: id }).exec();
      return count > 0;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'exists');
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      this.validateId(id);
      
      const record = await MedicalRecordModel.findById(id);
      if (!record) {
        return false;
      }
  
      await Promise.all([
        DiagnosisModel.deleteMany({ _id: { $in: record.diagnoses } }),
        TreatmentModel.deleteMany({ _id: { $in: record.treatments } }),
        PrescriptionModel.deleteMany({ _id: { $in: record.prescriptions } }),
      ]);
  
      const result = await MedicalRecordModel.deleteOne({ _id: id });

      return result.deletedCount > 0;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'delete');
    }
  }

  async cleanupCorruptedData(): Promise<void> {
    try { 
      const records = await MedicalRecordModel.find({
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
        const updates: any = {};
        
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
          await MedicalRecordModel.updateOne({ _id: record._id }, { $set: updates });
        }
      }
      
      console.log('Database cleanup completed: Removed invalid IDs from medical records');
    } catch (error) {
      ErrorHandler.handleAppError(error, 'cleanupCorruptedData');
    }
  }

  private toDomain(doc: any): MedicalRecord { 
    const diagnoses = Array.isArray(doc.diagnoses) 
      ? doc.diagnoses.map((d: any) => {
          if (typeof d === 'string') { 
            return Diagnosis.create({
              id: d,
              recordId: doc._id.toString(),
              description: '',
              date: new Date()
            });
          } else { 
            return Diagnosis.create({
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
      ? doc.treatments.map((t: any) => {
          if (typeof t === 'string') {
            return Treatment.create({
              id: t,
              recordId: doc._id.toString(),
              name: '',
              description: '',
              cost: 0,
              date: new Date()
            });
          } else {
            return Treatment.create({
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
      ? doc.prescriptions.map((p: any) => {
          if (typeof p === 'string') {
            return Prescription.create({
              id: p,
              recordId: doc._id.toString(),
              medicationName: '',
              dosage: '',
              instructions: '',
              refills: 0,
              datePrescribed: new Date()
            });
          } else {
            return Prescription.create({
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

    const record = new MedicalRecord({
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
  
  private toPersistence(record: MedicalRecord): any { 
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

  private diagnosisToPersistence(diagnosis: Diagnosis): any {
    return { 
      recordId: diagnosis.recordId,
      description: diagnosis.description,
      date: diagnosis.date,
      notes: diagnosis.notes,
    };
  }

  private treatmentToPersistence(treatment: Treatment): any {
    return { 
      recordId: treatment.recordId,
      name: treatment.name,
      description: treatment.description,
      date: treatment.date,
      cost: treatment.cost,
    };
  }

  private prescriptionToPersistence(prescription: Prescription): any {
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
