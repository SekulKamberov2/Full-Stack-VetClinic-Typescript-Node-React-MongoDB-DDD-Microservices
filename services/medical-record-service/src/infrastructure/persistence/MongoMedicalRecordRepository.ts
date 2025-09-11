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
import { BaseMongoRepository } from "./BaseMongoRepository";
import { NotFoundError, ValidationError } from "@vetclinic/shared-kernel";

export class MongoMedicalRecordRepository extends BaseMongoRepository<MedicalRecord> implements MedicalRecordRepository {
  protected model = MedicalRecordModel;

  constructor(private eventPublisher: EventPublisher) {
    super();
  }

  protected toEntity(doc: any): MedicalRecord { 
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

  protected toDocument(record: MedicalRecord): any { 
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

  async findById(id: string): Promise<MedicalRecord | null> {
    try {
      this.ensureConnection();
      this.validateId(id);
      
      const recordDoc = await this.executeWithLogging('findById', () =>
        this.model.findById(id)
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
          .exec()
      );
      
      return recordDoc ? this.toEntity(recordDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByPatientId(patientId: string): Promise<MedicalRecord[]> {
    try {
      this.ensureConnection();
      
      if (!patientId || patientId.trim() === '') {
        throw new ValidationError("Patient ID is required", undefined, 'MedicalRecord repository');
      }

      const recordDocs = await this.executeWithLogging('findByPatientId', () =>
        this.model.find({ patientId })
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
          .exec()
      );
      
      return recordDocs.map((doc) => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByPatientId');
    }
  } 

  async findByClientId(clientId: string): Promise<MedicalRecord[]> {
    try {
      this.ensureConnection();
      
      if (!clientId || clientId.trim() === '') {
        throw new ValidationError("Client ID is required", undefined, 'MedicalRecord repository');
      }

      const recordDocs = await this.executeWithLogging('findByClientId', () =>
        this.model.find({ clientId })
          .populate('diagnoses')
          .populate('treatments')
          .populate('prescriptions')
          .exec()
      );
      
      return recordDocs.map((doc) => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByClientId');
    }
  }

  async findByVeterinarianId(veterinarianId: string): Promise<MedicalRecord[]> {
    try {
      this.ensureConnection();
      
      if (!veterinarianId || veterinarianId.trim() === '') {
        throw new ValidationError("Veterinarian ID is required", undefined, 'MedicalRecord repository');
      }

      const recordDocs = await this.executeWithLogging('findByVeterinarianId', () =>
        this.model.find({ veterinarianId })
          .populate('diagnoses')
          .populate('treatments')
          .populate('prescriptions')
          .exec()
      );
      
      return recordDocs.map((doc) => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByVeterinarianId');
    }
  }

  async findByAppointmentId(appointmentId: string): Promise<MedicalRecord | null> {
    try {
      this.ensureConnection();
      
      if (!appointmentId || appointmentId.trim() === '') {
        throw new ValidationError("Appointment ID is required", undefined, 'MedicalRecord repository');
      }

      const recordDoc = await this.executeWithLogging('findByAppointmentId', () =>
        this.model.findOne({ appointmentId })
          .populate('diagnoses')
          .populate('treatments')
          .populate('prescriptions')
          .exec()
      );
      
      return recordDoc ? this.toEntity(recordDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findByAppointmentId');
    }
  }
 
  async findAll(filter: any = {}, options: {
    sort?: any;
    limit?: number;
    skip?: number;
  } = {}): Promise<MedicalRecord[]> {
    try {
      this.ensureConnection();
      
      let query = this.model.find(filter);
      
      if (options.sort) query = query.sort(options.sort);
      if (options.skip) query = query.skip(options.skip);
      if (options.limit) query = query.limit(options.limit);
      
      const documents = await this.executeWithLogging('findAll', () =>
        query.populate('diagnoses')
          .populate('treatments')
          .populate('prescriptions')
          .exec()
      );
      
      return documents.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }
 
  async findAllWithPagination(
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
      this.ensureConnection();
      
      const query: any = {};

      if (filters.patientId) query.patientId = filters.patientId;
      if (filters.clientId) query.clientId = filters.clientId;
      if (filters.veterinarianId) query.veterinarianId = filters.veterinarianId;
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) query.createdAt.$gte = filters.dateFrom;
        if (filters.dateTo) query.createdAt.$lte = filters.dateTo;
      }

      const [recordDocs, totalCount] = await Promise.all([
        this.executeWithLogging('findAllWithPagination', () =>
          this.model.find(query)
            .populate('diagnoses')
            .populate('treatments')
            .populate('prescriptions')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec()
        ),
        this.executeWithLogging('countAllWithPagination', () =>
          this.model.countDocuments(query).exec()
        ),
      ]);

      const records = recordDocs.map((doc) => this.toEntity(doc));
      return { records, totalCount };
    } catch (error) {
      this.handleDatabaseError(error, 'findAllWithPagination');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      this.ensureConnection();
      this.validateId(id);
      
      const count = await this.executeWithLogging('exists', () =>
        this.model.countDocuments({ _id: id }).exec()
      );
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error, 'exists');
    }
  }

  async update(medicalRecord: MedicalRecord): Promise<boolean> {
    try {
      this.ensureConnection();
      
      if (!medicalRecord.id) {
        throw new ValidationError("Medical record ID is required for update", undefined, 'MedicalRecord repository');
      }
      
      this.validateId(medicalRecord.id);

      const result = await this.executeWithLogging('update', () =>
        this.model.findByIdAndUpdate(
          medicalRecord.id, 
          this.toDocument(medicalRecord),
          { new: true, runValidators: true }
        ).exec()
      );
      
      return result !== null;
    } catch (error) {
      this.handleDatabaseError(error, 'update');
    }
  }

  async findByClientIdWithPagination(
    clientId: string,
    skip: number = 0,
    limit: number = 50,
    filters?: any
  ): Promise<{ records: MedicalRecord[]; totalCount: number }> {
    try {
      this.ensureConnection();
      
      if (!clientId || clientId.trim() === '') {
        throw new ValidationError("Client ID is required", undefined, 'MedicalRecord repository');
      }

      const query: any = { clientId, ...filters };

      const [recordDocs, totalCount] = await Promise.all([
        this.executeWithLogging('findByClientIdWithPagination', () =>
          this.model.find(query)
            .populate('diagnoses')
            .populate('treatments')
            .populate('prescriptions')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec()
        ),
        this.executeWithLogging('countByClientId', () =>
          this.model.countDocuments(query).exec()
        ),
      ]);

      const records = recordDocs.map((doc) => this.toEntity(doc));
      return { records, totalCount };
    } catch (error) {
      this.handleDatabaseError(error, 'findByClientIdWithPagination');
    }
  }

   async findByVeterinarianIdWithPagination(
    veterinarianId: string,
    skip: number = 0,
    limit: number = 50,
    filters?: any
  ): Promise<{ records: MedicalRecord[]; totalCount: number }> {
    try {
      this.ensureConnection();
      
      if (!veterinarianId || veterinarianId.trim() === '') {
        throw new ValidationError("Veterinarian ID is required", undefined, 'MedicalRecord repository');
      }

      const query: any = { veterinarianId, ...filters };

      const [recordDocs, totalCount] = await Promise.all([
        this.executeWithLogging('findByVeterinarianIdWithPagination', () =>
          this.model.find(query)
            .populate('diagnoses')
            .populate('treatments')
            .populate('prescriptions')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec()
        ),
        this.executeWithLogging('countByVeterinarianId', () =>
          this.model.countDocuments(query).exec()
        ),
      ]);

      const records = recordDocs.map((doc) => this.toEntity(doc));
      return { records, totalCount };
    } catch (error) {
      this.handleDatabaseError(error, 'findByVeterinarianIdWithPagination');
    }
  }

  async findByPatientIdWithPagination(
    patientId: string,
    skip: number = 0,
    limit: number = 50,
    filters?: any
  ): Promise<{ records: MedicalRecord[]; totalCount: number }> {
    try {
      this.ensureConnection();
      
      if (!patientId || patientId.trim() === '') {
        throw new ValidationError("Patient ID is required", undefined, 'MedicalRecord repository');
      }

      const query: any = { patientId, ...filters };

      const [recordDocs, totalCount] = await Promise.all([
        this.executeWithLogging('findByPatientIdWithPagination', () =>
          this.model.find(query)
            .populate('diagnoses')
            .populate('treatments')
            .populate('prescriptions')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .exec()
        ),
        this.executeWithLogging('countByPatientId', () =>
          this.model.countDocuments(query).exec()
        ),
      ]);

      const records = recordDocs.map((doc) => this.toEntity(doc));
      return { records, totalCount };
    } catch (error) {
      this.handleDatabaseError(error, 'findByPatientIdWithPagination');
    }
  }

 async delete(id: string): Promise<boolean> {
    try {
      this.ensureConnection();
      this.validateId(id);
      
      const result = await this.executeWithLogging('delete', () =>
        this.model.findByIdAndDelete(id).exec()
      );
      
      return result !== null;
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
    }
  }

  async save(record: MedicalRecord): Promise<MedicalRecord> {
    try {
      this.ensureConnection();
      
      return await this.withTransaction(async (session) => {
        const recordData = this.toDocument(record); 
        let savedRecord;
        
        if (!record.id) {
          const createdRecords = await this.model.create([recordData], { session });
          savedRecord = createdRecords[0];
        } else {
          savedRecord = await this.model.findOneAndUpdate(
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

        const savedEntity = this.toEntity(savedRecord);
        
        for (const event of record.domainEvents) {
          await this.eventPublisher.publish(event);
        }
        record.clearEvents();

        return savedEntity;
      });
      
    } catch (error) {
      if (this.isTransactionError(error)) {
        console.warn('Transactions not supported, falling back to non-transactional save');
        return await this.saveWithoutTransaction(record);
      }
      this.handleDatabaseError(error, 'save');
    }
  }

  private async saveWithoutTransaction(record: MedicalRecord): Promise<MedicalRecord> {
    try {
      this.ensureConnection();
      
      const recordData = this.toDocument(record);
      
      let savedRecord;
      
      if (!record.id) {
        const createdRecords = await this.model.create([recordData]);
        savedRecord = createdRecords[0];
      } else {
        savedRecord = await this.model.findOneAndUpdate(
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
  
      const updatedRecord = await this.model.findByIdAndUpdate(
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

      const savedEntity = this.toEntity(updatedRecord);
      
      for (const event of record.domainEvents) {
        await this.eventPublisher.publish(event);
      }
      record.clearEvents();

      return savedEntity;
      
    } catch (error) {
      this.handleDatabaseError(error, 'saveWithoutTransaction');
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

  async cleanupCorruptedData(): Promise<void> {
    try {
      this.ensureConnection();
      
      const records = await this.executeWithLogging('findCorrupted', () =>
        this.model.find({
          $or: [
            { diagnoses: "" },
            { treatments: "" },
            { prescriptions: "" },
            { diagnoses: { $exists: true, $type: "string" } },
            { treatments: { $exists: true, $type: "string" } },
            { prescriptions: { $exists: true, $type: "string" } }
          ]
        }).exec()
      );

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
          await this.executeWithLogging('cleanupRecord', () =>
            this.model.updateOne({ _id: record._id }, { $set: updates }).exec()
          );
        }
      }
      
      console.log('Database cleanup completed: Removed invalid IDs from medical records');
    } catch (error) {
      this.handleDatabaseError(error, 'cleanupCorruptedData');
    }
  }

  private filterValidIds(ids: any[]): string[] {
    return ids
      .filter(id => id !== null && id !== undefined)
      .map(id => id.toString())
      .filter(id => this.isValidObjectId(id));
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
