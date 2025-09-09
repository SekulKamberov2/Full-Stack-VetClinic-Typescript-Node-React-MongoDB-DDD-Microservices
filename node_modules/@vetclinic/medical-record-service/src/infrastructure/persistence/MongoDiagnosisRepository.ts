import { Diagnosis, DiagnosisProps } from "../../domain/entities/Diagnosis";
import { DiagnosisRepository } from "../../domain/repositories/DiagnosisRepository";
import { DiagnosisModel } from "./models/DiagnosisModel";
import { ValidationError } from '@vetclinic/shared-kernel';
import { BaseMongoRepository } from "./BaseMongoRepository";

export class MongoDiagnosisRepository extends BaseMongoRepository<Diagnosis> implements DiagnosisRepository {
  protected model = DiagnosisModel;

  protected toEntity(doc: any): Diagnosis {
    const props: DiagnosisProps = {
      id: doc._id.toString(),
      recordId: doc.recordId,
      description: doc.description,
      date: doc.date,
      notes: doc.notes,
    };
    return Diagnosis.create(props);
  }

  protected toDocument(diagnosis: Diagnosis): any {
    return { 
      recordId: diagnosis.recordId,
      description: diagnosis.description,
      date: diagnosis.date,
      notes: diagnosis.notes
    };
  }

  async findByRecordId(recordId: string): Promise<Diagnosis[]> {
    try {
      if (!recordId || recordId.trim() === '') {
        throw new ValidationError("Record ID is required", undefined, 'Diagnosis repository');
      }

      const diagnosisDocs = await this.executeWithLogging('findByRecordId', () =>
        DiagnosisModel.find({ recordId })
          .sort({ date: -1 })
          .exec()
      );
      return diagnosisDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByRecordId');
    }
  }

  async findByDescription(description: string): Promise<Diagnosis[]> {
    try {
      if (!description || description.trim() === '') {
        throw new ValidationError("Description is required", undefined, 'Diagnosis repository');
      }

      const diagnosisDocs = await this.executeWithLogging('findByDescription', () =>
        DiagnosisModel.find({ 
          description: { $regex: new RegExp(description, 'i') }
        }).exec()
      );
      return diagnosisDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByDescription');
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Diagnosis[]> {
    try {
      if (!startDate || !endDate) {
        throw new ValidationError("Start date and end date are required", undefined, 'Diagnosis repository');
      }

      if (startDate > endDate) {
        throw new ValidationError("Start date cannot be after end date", undefined, 'Diagnosis repository');
      }

      const diagnosisDocs = await this.executeWithLogging('findByDateRange', () =>
        DiagnosisModel.find({ 
          date: { $gte: startDate, $lte: endDate }
        }).exec()
      );
      return diagnosisDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByDateRange');
    }
  }

  async findRecent(days: number = 30): Promise<Diagnosis[]> {
    try {
      if (days <= 0) {
        throw new ValidationError("Days must be a positive number", undefined, 'Diagnosis repository');
      }

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      
      const diagnosisDocs = await this.executeWithLogging('findRecent', () =>
        DiagnosisModel.find({ 
          date: { $gte: cutoffDate }
        }).exec()
      );
      return diagnosisDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findRecent');
    }
  }

  async findWithNotes(): Promise<Diagnosis[]> {
    try {
      const diagnosisDocs = await this.executeWithLogging('findWithNotes', () =>
        DiagnosisModel.find({ 
          notes: { $exists: true, $ne: '' } 
        }).exec()
      );
      return diagnosisDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findWithNotes');
    }
  }

  async findAll(): Promise<Diagnosis[]> {
    try {
      const diagnosisDocs = await this.executeWithLogging('findAll', () =>
        DiagnosisModel.find().exec()
      );
      return diagnosisDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async getStats(): Promise<{
    totalDiagnoses: number;
    diagnosesWithNotes: number;
    diagnosesByRecord: Record<string, number>;
    mostCommonDiagnoses: { diagnosis: string; count: number }[];
  }> {
    try {
      const [totalDiagnoses, diagnosesWithNotes, diagnosesByRecordAgg, mostCommonDiagnosesAgg] = 
        await Promise.all([
          DiagnosisModel.countDocuments(),
          DiagnosisModel.countDocuments({ notes: { $exists: true, $ne: '' } }),
          DiagnosisModel.aggregate([
            { $group: { _id: '$recordId', count: { $sum: 1 } } }
          ]),
          DiagnosisModel.aggregate([
            { $group: { _id: '$description', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ])
        ]);

      const diagnosesByRecord: Record<string, number> = {};
      diagnosesByRecordAgg.forEach(item => {
        diagnosesByRecord[item._id] = item.count;
      });

      const mostCommonDiagnoses = mostCommonDiagnosesAgg.map(item => ({
        diagnosis: item._id,
        count: item.count
      }));

      return {
        totalDiagnoses,
        diagnosesWithNotes,
        diagnosesByRecord,
        mostCommonDiagnoses
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getStats');
    }
  }

  async save(diagnosis: Diagnosis): Promise<Diagnosis> {
    try {
      const diagnosisDoc = new DiagnosisModel(this.toDocument(diagnosis));
      const savedDoc = await this.executeWithLogging('save', () =>
        diagnosisDoc.save()
      );
      return this.toEntity(savedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async update(diagnosis: Diagnosis): Promise<void> {
    try {
      await this.executeWithLogging('update', () =>
        DiagnosisModel.findByIdAndUpdate(
          diagnosis.id, 
          this.toDocument(diagnosis),
          { new: true, runValidators: true }
        ).exec()
      );
    } catch (error) {
      this.handleDatabaseError(error, 'update');
    }
  }

  async updateById(id: string, updateData: Partial<Diagnosis>): Promise<void> {
    try {
      this.validateId(id);

      const updateQuery: any = {};
      
      if (updateData.description !== undefined) {
        if (!updateData.description || updateData.description.trim() === '') {
          throw new ValidationError("Description cannot be empty", undefined, 'Diagnosis repository');
        }
        updateQuery.description = updateData.description;
      }

      if (updateData.notes !== undefined) updateQuery.notes = updateData.notes;
      if (updateData.date !== undefined) updateQuery.date = updateData.date;
      
      if (updateData.recordId !== undefined) {
        if (!updateData.recordId || updateData.recordId.trim() === '') {
          throw new ValidationError("Record ID cannot be empty", undefined, 'Diagnosis repository');
        }
        updateQuery.recordId = updateData.recordId;
      }

      await this.executeWithLogging('updateById', () =>
        DiagnosisModel.findByIdAndUpdate(
          id,
          updateQuery,
          { new: true, runValidators: true }
        ).exec()
      );
    } catch (error) {
      this.handleDatabaseError(error, 'updateById');
    }
  }

  async search(query: string): Promise<Diagnosis[]> {
    try {
      if (!query || query.trim() === '') {
        throw new ValidationError("Search query is required", undefined, 'Diagnosis repository');
      }

      const diagnosisDocs = await this.executeWithLogging('search', () =>
        DiagnosisModel.find({
          $or: [
            { description: { $regex: new RegExp(query, 'i') } },
            { notes: { $regex: new RegExp(query, 'i') } }
          ]
        }).exec()
      );
      return diagnosisDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'search');
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
      const [total, withNotes, byRecordAgg, topDiagnosesAgg, monthlyTrendAgg] = 
        await Promise.all([
          DiagnosisModel.countDocuments(),
          DiagnosisModel.countDocuments({ notes: { $exists: true, $ne: '' } }),
          DiagnosisModel.aggregate([{ $group: { _id: '$recordId', count: { $sum: 1 } } }]),
          DiagnosisModel.aggregate([
            { $group: { _id: '$description', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
          ]),
          DiagnosisModel.aggregate([
            {
              $group: {
                _id: { year: { $year: '$date' }, month: { $month: '$date' } },
                count: { $sum: 1 }
              }
            },
            { $sort: { '_id.year': 1, '_id.month': 1 } },
            { $limit: 12 }
          ])
        ]);

      const byRecord: Record<string, number> = {};
      byRecordAgg.forEach(item => {
        byRecord[item._id] = item.count;
      });

      const topDiagnoses = topDiagnosesAgg.map(item => ({
        diagnosis: item._id,
        count: item.count
      }));

      const monthlyTrend = monthlyTrendAgg.map(item => ({
        month: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}`,
        count: item.count
      }));

      return { total, withNotes, byRecord, topDiagnoses, monthlyTrend };
    } catch (error) {
      this.handleDatabaseError(error, 'getDiagnosisStats');
    }
  }

  async bulkUpdateNotes(ids: string[], notes: string): Promise<void> {
    try {
      if (!ids || ids.length === 0) {
        throw new ValidationError("IDs array cannot be empty", undefined, 'Diagnosis repository');
      }

      ids.forEach(id => this.validateId(id));

      await this.executeWithLogging('bulkUpdateNotes', () =>
        DiagnosisModel.updateMany(
          { _id: { $in: ids } },
          { notes },
          { runValidators: true }
        ).exec()
      );
    } catch (error) {
      this.handleDatabaseError(error, 'bulkUpdateNotes');
    }
  }

  async getDiagnosisTrend(startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]> {
    try {
      if (!startDate || !endDate) {
        throw new ValidationError("Start date and end date are required", undefined, 'Diagnosis repository');
      }

      if (startDate > endDate) {
        throw new ValidationError("Start date cannot be after end date", undefined, 'Diagnosis repository');
      }

      const trendAgg = await this.executeWithLogging('getDiagnosisTrend', () =>
        DiagnosisModel.aggregate([
          {
            $match: {
              date: { $gte: startDate, $lte: endDate }
            }
          },
          {
            $group: {
              _id: {
                year: { $year: '$date' },
                month: { $month: '$date' },
                day: { $dayOfMonth: '$date' }
              },
              count: { $sum: 1 }
            }
          },
          { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
        ])
      );

      return trendAgg.map(item => ({
        date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
        count: item.count
      }));
    } catch (error) {
      this.handleDatabaseError(error, 'getDiagnosisTrend');
    }
  }
}
