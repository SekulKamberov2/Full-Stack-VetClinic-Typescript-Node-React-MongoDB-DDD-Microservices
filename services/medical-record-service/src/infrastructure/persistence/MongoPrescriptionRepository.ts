import { Prescription } from "../../domain/entities/Prescription";
import { PrescriptionRepository } from "../../domain/repositories/PrescriptionRepository";
import { PrescriptionModel } from "../persistence/models/PrescriptionModel";
import { MedicalRecordModel } from "../persistence/models/MedicalRecord";
import mongoose from "mongoose";
import { ErrorHandler, ValidationError, NotFoundError } from "@vetclinic/shared-kernel";

export class MongoPrescriptionRepository implements PrescriptionRepository {
  private isValidObjectId(id: string): boolean {
    if (!id || id.trim() === '') {
      return false;
    }
    return mongoose.Types.ObjectId.isValid(id);
  }

  private validateId(id: string): void {
    if (!this.isValidObjectId(id)) {
      throw new ValidationError("Invalid ID format", undefined, 'Prescription repository');
    }
  }

  async findById(id: string): Promise<Prescription | null> {
    try {
      this.validateId(id);
      
      const prescriptionDoc = await PrescriptionModel.findById(id).exec();
      return prescriptionDoc ? this.toEntity(prescriptionDoc) : null;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findById');
    }
  }

  async findByRecordId(recordId: string): Promise<Prescription[]> {
    try {
      if (!recordId || recordId.trim() === '') {
        throw new ValidationError("Record ID is required", undefined, 'Prescription repository');
      }

      const prescriptionDocs = await PrescriptionModel.find({ recordId })
        .sort({ datePrescribed: -1 })
        .exec();
      return prescriptionDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByRecordId');
    }
  }

  async findByMedicationName(medicationName: string): Promise<Prescription[]> {
    try {
      if (!medicationName || medicationName.trim() === '') {
        throw new ValidationError("Medication name is required", undefined, 'Prescription repository');
      }

      const prescriptionDocs = await PrescriptionModel.find({ 
        medicationName: { $regex: new RegExp(medicationName, 'i') }
      }).exec();
      return prescriptionDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByMedicationName');
    }
  }

  async findByRefills(refills: number): Promise<Prescription[]> {
    try {
      if (refills < 0) {
        throw new ValidationError("Refills cannot be negative", undefined, 'Prescription repository');
      }

      const prescriptionDocs = await PrescriptionModel.find({ refills }).exec();
      return prescriptionDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByRefills');
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Prescription[]> {
    try {
      if (!startDate || !endDate) {
        throw new ValidationError("Start date and end date are required", undefined, 'Prescription repository');
      }

      if (startDate > endDate) {
        throw new ValidationError("Start date cannot be after end date", undefined, 'Prescription repository');
      }

      const prescriptionDocs = await PrescriptionModel.find({ 
        datePrescribed: { $gte: startDate, $lte: endDate }
      }).exec();
      return prescriptionDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByDateRange');
    }
  }

  async findByStatus(status: string): Promise<Prescription[]> {
    try {
      if (!status || status.trim() === '') {
        throw new ValidationError("Status is required", undefined, 'Prescription repository');
      }

      const prescriptionDocs = await PrescriptionModel.find({ status }).exec();
      return prescriptionDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByStatus');
    }
  }

  async findExpiringRefills(days: number = 30): Promise<Prescription[]> {
    try {
      if (days <= 0) {
        throw new ValidationError("Days must be a positive number", undefined, 'Prescription repository');
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() + days);
      
      const prescriptionDocs = await PrescriptionModel.find({ 
        refills: { $gt: 0 },
        datePrescribed: { $lte: cutoffDate }
      }).exec();
      return prescriptionDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findExpiringRefills');
    }
  }

  async findAll(): Promise<Prescription[]> {
    try {
      const prescriptionDocs = await PrescriptionModel.find().exec();
      return prescriptionDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findAll');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      this.validateId(id);
      const count = await PrescriptionModel.countDocuments({ _id: id }).exec();
      return count > 0;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'exists');
    }
  }

  async getStats(): Promise<{
    totalPrescriptions: number;
    prescriptionsWithRefills: number;
    prescriptionsByRecord: Record<string, number>;
    mostPrescribedMedications: { medication: string; count: number }[];
    prescriptionsByStatus: Record<string, number>;
  }> {
    try {
      const [totalPrescriptions, prescriptionsWithRefills, prescriptionsByRecordAgg, mostPrescribedMedicationsAgg, prescriptionsByStatusAgg] = 
        await Promise.all([
          PrescriptionModel.countDocuments(),
          PrescriptionModel.countDocuments({ refills: { $gt: 0 } }),
          PrescriptionModel.aggregate([
            {
              $group: {
                _id: '$recordId',
                count: { $sum: 1 }
              }
            }
          ]),
          PrescriptionModel.aggregate([
            {
              $group: {
                _id: '$medicationName',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]),
          PrescriptionModel.aggregate([
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ])
        ]);

      const prescriptionsByRecord: Record<string, number> = {};
      prescriptionsByRecordAgg.forEach(item => {
        prescriptionsByRecord[item._id] = item.count;
      });

      const mostPrescribedMedications = mostPrescribedMedicationsAgg.map(item => ({
        medication: item._id,
        count: item.count
      }));

      const prescriptionsByStatus: Record<string, number> = {};
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
    } catch (error) {
      ErrorHandler.handleAppError(error, 'getStats');
    }
  }

  async save(prescription: Prescription): Promise<Prescription> {
    try { 
      return await this.saveWithTransaction(prescription);
    } catch (error) { 
      if (this.isTransactionError(error)) {
        console.warn('Transactions not supported, falling back to non-transactional prescription save');
        return await this.saveWithoutTransaction(prescription);
      } 
      ErrorHandler.handleAppError(error, 'save');
    }
  }

  private async saveWithTransaction(prescription: Prescription): Promise<Prescription> {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();

      let savedPrescription;
      
      if (!prescription.id) {  
        const prescriptionDoc = new PrescriptionModel(this.toDocument(prescription));
        const savedDoc = await prescriptionDoc.save({ session });
        savedPrescription = this.toEntity(savedDoc);
 
        await MedicalRecordModel.findByIdAndUpdate(
          prescription.recordId,
          { $push: { prescriptions: savedDoc._id } },
          { session, new: true }
        ).exec();
        
      } else {  
        const updatedDoc = await PrescriptionModel.findByIdAndUpdate(
          prescription.id,
          this.toDocument(prescription),
          { new: true, runValidators: true, session }
        ).exec();
        
        if (!updatedDoc) {
          throw new NotFoundError(`Prescription with ID ${prescription.id} not found`);
        }
        
        savedPrescription = this.toEntity(updatedDoc);
      }

      await session.commitTransaction();
      session.endSession();
      
      return savedPrescription;
      
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      ErrorHandler.handleAppError(error, 'saveWithTransaction');
    }
  }

  private async saveWithoutTransaction(prescription: Prescription): Promise<Prescription> {
    try {
      let savedPrescription;
      
      if (!prescription.id) {   
        const prescriptionDoc = new PrescriptionModel(this.toDocument(prescription));
        const savedDoc = await prescriptionDoc.save();
        savedPrescription = this.toEntity(savedDoc);
  
        await MedicalRecordModel.findByIdAndUpdate(
          prescription.recordId,
          { $push: { prescriptions: savedDoc._id } },
          { new: true }
        ).exec();
        
      } else {   
        const updatedDoc = await PrescriptionModel.findByIdAndUpdate(
          prescription.id,
          this.toDocument(prescription),
          { new: true, runValidators: true }
        ).exec();
        
        if (!updatedDoc) {
          throw new NotFoundError(`Prescription with ID ${prescription.id} not found`);
        }
        
        savedPrescription = this.toEntity(updatedDoc);
      }
      
      return savedPrescription;
      
    } catch (error) {
      ErrorHandler.handleAppError(error, 'saveWithoutTransaction');
    }
  }

  async update(prescription: Prescription): Promise<void> {
    try {
      this.validateId(prescription.id);

      await PrescriptionModel.findByIdAndUpdate(
        prescription.id, 
        this.toDocument(prescription),
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      ErrorHandler.handleAppError(error, 'update');
    }
  }

  async updateById(id: string, updateData: Partial<Prescription>): Promise<void> {
    try {
      this.validateId(id);

      const updateQuery: any = {};
      
      if (updateData.recordId !== undefined) {
        if (!updateData.recordId || updateData.recordId.trim() === '') {
          throw new ValidationError("Record ID cannot be empty", undefined, 'Prescription repository');
        }
        updateQuery.recordId = updateData.recordId;
      }

      if (updateData.medicationName !== undefined) {
        if (!updateData.medicationName || updateData.medicationName.trim() === '') {
          throw new ValidationError("Medication name cannot be empty", undefined, 'Prescription repository');
        }
        updateQuery.medicationName = updateData.medicationName;
      }

      if (updateData.dosage !== undefined) updateQuery.dosage = updateData.dosage;
      if (updateData.instructions !== undefined) updateQuery.instructions = updateData.instructions;
      
      if (updateData.refills !== undefined) {
        if (updateData.refills < 0) {
          throw new ValidationError("Refills cannot be negative", undefined, 'Prescription repository');
        }
        updateQuery.refills = updateData.refills;
      }
      
      if (updateData.datePrescribed !== undefined) updateQuery.datePrescribed = updateData.datePrescribed;
      if (updateData.filledDate !== undefined) updateQuery.filledDate = updateData.filledDate;
      if (updateData.filledBy !== undefined) updateQuery.filledBy = updateData.filledBy;
      if (updateData.status !== undefined) updateQuery.status = updateData.status;

      await PrescriptionModel.findByIdAndUpdate(
        id,
        updateQuery,
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      ErrorHandler.handleAppError(error, 'updateById');
    }
  }

  async delete(id: string): Promise<void> {
    try { 
      return await this.deleteWithTransaction(id);
    } catch (error) { 
      if (this.isTransactionError(error)) {
        console.warn('Transactions not supported, falling back to non-transactional prescription delete');
        return await this.deleteWithoutTransaction(id);
      } 
      ErrorHandler.handleAppError(error, 'delete');
    }
  }

  private async deleteWithTransaction(id: string): Promise<void> {
    const session = await mongoose.startSession();
    
    try {
      session.startTransaction();
 
      const prescription = await PrescriptionModel.findById(id).session(session);
      if (!prescription) {
        throw new NotFoundError(`Prescription with ID ${id} not found`);
      }
 
      await PrescriptionModel.findByIdAndDelete(id).session(session);
 
      await MedicalRecordModel.findByIdAndUpdate(
        prescription.recordId,
        { $pull: { prescriptions: id } },
        { session, new: true }
      ).exec();

      await session.commitTransaction();
      session.endSession();
      
    } catch (error) {
      await session.abortTransaction();
      session.endSession();
      ErrorHandler.handleAppError(error, 'deleteWithTransaction');
    }
  }

  private async deleteWithoutTransaction(id: string): Promise<void> {
    try { 
      this.validateId(id);
      
      const prescription = await PrescriptionModel.findById(id);
      if (!prescription) {
        throw new NotFoundError(`Prescription with ID ${id} not found`);
      }
 
      await PrescriptionModel.findByIdAndDelete(id);
 
      await MedicalRecordModel.findByIdAndUpdate(
        prescription.recordId,
        { $pull: { prescriptions: id } },
        { new: true }
      ).exec();
      
    } catch (error) {
      ErrorHandler.handleAppError(error, 'deleteWithoutTransaction');
    }
  }

  async search(query: string): Promise<Prescription[]> {
    try {
      if (!query || query.trim() === '') {
        throw new ValidationError("Search query is required", undefined, 'Prescription repository');
      }

      const prescriptionDocs = await PrescriptionModel.find({
        $or: [
          { medicationName: { $regex: new RegExp(query, 'i') } },
          { dosage: { $regex: new RegExp(query, 'i') } },
          { instructions: { $regex: new RegExp(query, 'i') } }
        ]
      }).exec();
      return prescriptionDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'search');
    }
  }

  async getPrescriptionStats(): Promise<{
    total: number;
    withRefills: number;
    byRecord: Record<string, number>;
    topMedications: { medication: string; count: number }[];
    refillDistribution: { refills: number; count: number }[];
    byStatus: Record<string, number>;
  }> {
    try {
      const [total, withRefills, byRecordAgg, topMedicationsAgg, refillDistributionAgg, byStatusAgg] = 
        await Promise.all([
          PrescriptionModel.countDocuments(),
          PrescriptionModel.countDocuments({ refills: { $gt: 0 } }),
          PrescriptionModel.aggregate([
            {
              $group: {
                _id: '$recordId',
                count: { $sum: 1 }
              }
            }
          ]),
          PrescriptionModel.aggregate([
            {
              $group: {
                _id: '$medicationName',
                count: { $sum: 1 }
              }
            },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]),
          PrescriptionModel.aggregate([
            {
              $group: {
                _id: '$refills',
                count: { $sum: 1 }
              }
            },
            { $sort: { _id: 1 } }
          ]),
          PrescriptionModel.aggregate([
            {
              $group: {
                _id: '$status',
                count: { $sum: 1 }
              }
            }
          ])
        ]);

      const byRecord: Record<string, number> = {};
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

      const byStatus: Record<string, number> = {};
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
    } catch (error) {
      ErrorHandler.handleAppError(error, 'getPrescriptionStats');
    }
  }

  async decrementRefill(id: string): Promise<void> {
    try {
      this.validateId(id);

      const prescription = await PrescriptionModel.findById(id);
      if (!prescription) {
        throw new NotFoundError(`Prescription with ID ${id} not found`);
      }

      if (prescription.refills <= 0) {
        throw new ValidationError("Cannot decrement refills - already at 0", undefined, 'Prescription repository');
      }

      await PrescriptionModel.findByIdAndUpdate(
        id,
        { $inc: { refills: -1 } },
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      ErrorHandler.handleAppError(error, 'decrementRefill');
    }
  }

  async bulkUpdateRefills(ids: string[], refills: number): Promise<void> {
    try {
      if (!ids || ids.length === 0) {
        throw new ValidationError("IDs array cannot be empty", undefined, 'Prescription repository');
      }

      if (refills < 0) {
        throw new ValidationError("Refills cannot be negative", undefined, 'Prescription repository');
      }

      ids.forEach(id => this.validateId(id));

      await PrescriptionModel.updateMany(
        { _id: { $in: ids } },
        { refills },
        { runValidators: true }
      ).exec();
    } catch (error) {
      ErrorHandler.handleAppError(error, 'bulkUpdateRefills');
    }
  }

  async markAsFilled(id: string, filledDate: Date, filledBy: string): Promise<void> {
    try {
      this.validateId(id);

      if (!filledBy || filledBy.trim() === '') {
        throw new ValidationError("Filled by field is required", undefined, 'Prescription repository');
      }

      await PrescriptionModel.findByIdAndUpdate(
        id,
        {
          filledDate,
          filledBy,
          status: 'filled'
        },
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      ErrorHandler.handleAppError(error, 'markAsFilled');
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

  private toEntity(doc: any): Prescription {
    return Prescription.create({
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

  private toDocument(prescription: Prescription): any {
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
