import { Diagnosis } from "../../domain/entities/Diagnosis";
import { DiagnosisRepository } from "../../domain/repositories/DiagnosisRepository";
import { BaseMongoRepository } from "./BaseMongoRepository";
import { DiagnosisModel } from "./models/DiagnosisModel";
import { ValidationError } from "@vetclinic/shared-kernel";

export class MongoDiagnosisRepository extends BaseMongoRepository<Diagnosis> implements DiagnosisRepository {
  protected model = DiagnosisModel;

  protected toEntity(doc: any): Diagnosis {
    return Diagnosis.create({
      id: doc._id.toString(),
      recordId: doc.recordId,
      description: doc.description,
      date: doc.date,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    });
  }

  protected toDocument(diagnosis: Diagnosis): any {
    return {
      recordId: diagnosis.recordId,
      description: diagnosis.description,
      date: diagnosis.date,
      notes: diagnosis.notes,
      createdAt: diagnosis.createdAt,
      updatedAt: diagnosis.updatedAt
    };
  }

  async findAll(): Promise<Diagnosis[]> {
    try {
      this.ensureConnection();
      
      const documents = await this.executeWithLogging('findAll', () =>
        this.model.find().sort({ date: -1 }).exec()
      );
      
      return documents.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async save(diagnosis: Diagnosis): Promise<Diagnosis> {
    try {
      this.ensureConnection();
      
      const document = new this.model(this.toDocument(diagnosis));
      const savedDoc = await this.executeWithLogging('save', () =>
        document.save()
      );
      return this.toEntity(savedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
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

  async update(diagnosis: Diagnosis): Promise<boolean> {
    return super.update(diagnosis);
  }

  async findByRecordId(recordId: string): Promise<Diagnosis[]> {
    try {
      this.ensureConnection();
      
      if (!recordId || recordId.trim() === '') {
        throw new ValidationError("Record ID is required", undefined, 'Diagnosis repository');
      }

      const documents = await this.executeWithLogging('findByRecordId', () =>
        this.model.find({ recordId }).sort({ date: -1 }).exec()
      );
      
      return documents.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByRecordId');
    }
  }

  async findByDescription(description: string): Promise<Diagnosis[]> {
    try {
      this.ensureConnection();
      
      if (!description || description.trim() === '') {
        return [];
      }

      const documents = await this.executeWithLogging('findByDescription', () =>
        this.model.find({ 
          description: { $regex: new RegExp(description, 'i') }
        }).sort({ date: -1 }).exec()
      );
      
      return documents.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByDescription');
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Diagnosis[]> {
    try {
      this.ensureConnection();
      
      if (!startDate || !endDate) {
        throw new ValidationError("Both start and end dates are required", undefined, 'Diagnosis repository');
      }

      if (startDate > endDate) {
        throw new ValidationError("Start date cannot be after end date", undefined, 'Diagnosis repository');
      }

      const documents = await this.executeWithLogging('findByDateRange', () =>
        this.model.find({ 
          date: { 
            $gte: startDate, 
            $lte: endDate 
          } 
        }).sort({ date: -1 }).exec()
      );
      
      return documents.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByDateRange');
    }
  }

  async findRecent(days: number = 30): Promise<Diagnosis[]> {
    try {
      this.ensureConnection();
      
      if (days <= 0) {
        throw new ValidationError("Days must be a positive number", undefined, 'Diagnosis repository');
      }

      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const documents = await this.executeWithLogging('findRecent', () =>
        this.model.find({ 
          date: { $gte: startDate } 
        }).sort({ date: -1 }).exec()
      );
      
      return documents.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findRecent');
    }
  }

  async findWithNotes(): Promise<Diagnosis[]> {
    try {
      this.ensureConnection();
      
      const documents = await this.executeWithLogging('findWithNotes', () =>
        this.model.find({ 
          $and: [
            { notes: { $exists: true } },
            { notes: { $ne: null } },
            { notes: { $ne: "" } }
          ]
        }).sort({ date: -1 }).exec()
      );
      
      return documents.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findWithNotes');
    }
  }

  async search(query: string): Promise<Diagnosis[]> {
    try {
      this.ensureConnection();
      
      if (!query || query.trim() === '') {
        return [];
      }

      const documents = await this.executeWithLogging('search', () =>
        this.model.find({
          $or: [
            { description: { $regex: new RegExp(query, 'i') } },
            { notes: { $regex: new RegExp(query, 'i') } }
          ]
        }).sort({ date: -1 }).exec()
      );
      
      return documents.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'search');
    }
  }

  async getStats(): Promise<{
    totalDiagnoses: number;
    diagnosesWithNotes: number;
    diagnosesByRecord: Record<string, number>;
    mostCommonDiagnoses: { diagnosis: string; count: number }[];
  }> {
    try {
      this.ensureConnection();
      
      const [
        totalDiagnoses,
        diagnosesWithNotes,
        diagnosesByRecord,
        mostCommonDiagnoses
      ] = await Promise.all([
        this.executeWithLogging('countTotal', () => this.model.countDocuments().exec()),
        this.executeWithLogging('countWithNotes', () => 
          this.model.countDocuments({ 
            $and: [
              { notes: { $exists: true } },
              { notes: { $ne: null } },
              { notes: { $ne: "" } }
            ]
          }).exec()
        ),
        this.executeWithLogging('groupByRecord', () =>
          this.model.aggregate([
            { $group: { _id: "$recordId", count: { $sum: 1 } } }
          ]).exec() 
        ),
        this.executeWithLogging('mostCommonDiagnoses', () =>
          this.model.aggregate([
            { $group: { _id: "$description", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]).exec() 
        )
      ]);

      const diagnosesByRecordMap: Record<string, number> = {};
      diagnosesByRecord.forEach((item: any) => {
        diagnosesByRecordMap[item._id] = item.count;
      });

      return {
        totalDiagnoses,
        diagnosesWithNotes,
        diagnosesByRecord: diagnosesByRecordMap,
        mostCommonDiagnoses: mostCommonDiagnoses.map((item: any) => ({
          diagnosis: item._id,
          count: item.count
        }))
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getStats');
    }
  }

  async getDiagnosisStats(): Promise<{
    total: number;
    withNotes: number;
    byRecord: Record<string, number>;
    topDiagnoses: { diagnosis: string; count: number }[];
    monthlyTrend: { month: string; count: number }[];
  }> {
    try {
      this.ensureConnection();
      
      const [
        total,
        withNotes,
        byRecord,
        topDiagnoses,
        monthlyTrend
      ] = await Promise.all([
        this.executeWithLogging('countTotal', () => this.model.countDocuments().exec()),
        this.executeWithLogging('countWithNotes', () => 
          this.model.countDocuments({ 
            $and: [
              { notes: { $exists: true } },
              { notes: { $ne: null } },
              { notes: { $ne: "" } }
            ]
          }).exec()
        ),
        this.executeWithLogging('groupByRecord', () =>
          this.model.aggregate([
            { $group: { _id: "$recordId", count: { $sum: 1 } } }
          ]).exec()
        ),
        this.executeWithLogging('topDiagnoses', () =>
          this.model.aggregate([
            { $group: { _id: "$description", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]).exec()
        ),
        this.executeWithLogging('monthlyTrend', () =>
          this.model.aggregate([
            {
              $group: {
                _id: {
                  year: { $year: "$date" },
                  month: { $month: "$date" }
                },
                count: { $sum: 1 }
              }
            },
            { $sort: { "_id.year": 1, "_id.month": 1 } },
            { $limit: 12 }
          ]).exec()
        )
      ]);

      const byRecordMap: Record<string, number> = {};
      byRecord.forEach((item: any) => {
        byRecordMap[item._id] = item.count;
      });

      return {
        total,
        withNotes,
        byRecord: byRecordMap,
        topDiagnoses: topDiagnoses.map((item: any) => ({
          diagnosis: item._id,
          count: item.count
        })),
        monthlyTrend: monthlyTrend.map((item: any) => ({
          month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
          count: item.count
        }))
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getDiagnosisStats');
    }
  }

  async updateNotes(ids: string[], notes: string): Promise<void> {
    try {
      this.ensureConnection();
      
      if (!ids || ids.length === 0) {
        return;
      }

      const validIds = ids.filter(id => this.isValidObjectId(id));
      
      if (validIds.length === 0) {
        throw new ValidationError("No valid IDs provided", undefined, 'Diagnosis repository');
      }

      await this.executeWithLogging('bulkUpdateNotes', () =>
        this.model.updateMany(
          { _id: { $in: validIds } },
          { $set: { notes, updatedAt: new Date() } }
        ).exec()
      );
    } catch (error) {
      this.handleDatabaseError(error, 'bulkUpdateNotes');
    }
  }

  async getDiagnosisTrend(startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]> {
    try {
      this.ensureConnection();
      
      if (!startDate || !endDate) {
        throw new ValidationError("Both start and end dates are required", undefined, 'Diagnosis repository');
      }

      if (startDate > endDate) {
        throw new ValidationError("Start date cannot be after end date", undefined, 'Diagnosis repository');
      }

      const trendData = await this.executeWithLogging('getDiagnosisTrend', () =>
        this.model.aggregate([
          {
            $match: {
              date: {
                $gte: startDate,
                $lte: endDate
              }
            }
          },
          {
            $group: {
              _id: {
                $dateToString: {
                  format: "%Y-%m-%d",
                  date: "$date"
                }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { _id: 1 } }
        ]).exec()
      );

      return trendData.map((item: any) => ({
        date: item._id,
        count: item.count
      }));
    } catch (error) {
      this.handleDatabaseError(error, 'getDiagnosisTrend');
    }
  }

  async updateById(id: string, updateData: Partial<Diagnosis>): Promise<boolean> {
    try {
      this.ensureConnection();
      this.validateId(id);
      
      const documentData: any = {};
      
      if (updateData.description !== undefined) documentData.description = updateData.description;
      if (updateData.notes !== undefined) documentData.notes = updateData.notes;
      if (updateData.date !== undefined) documentData.date = updateData.date;
      documentData.updatedAt = new Date();

      const result = await this.executeWithLogging('updateById', () =>
        this.model.findByIdAndUpdate(
          id,
          { $set: documentData },
          { new: true, runValidators: true }
        ).exec()
      );
      
      return result !== null;
    } catch (error) {
      this.handleDatabaseError(error, 'updateById');
    }
  }
}
