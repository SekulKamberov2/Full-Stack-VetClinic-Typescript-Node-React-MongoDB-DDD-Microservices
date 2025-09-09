import { Treatment } from "../../domain/entities/Treatment";
import { TreatmentRepository } from "../../domain/repositories/TreatmentRepository";
import { TreatmentModel } from "./models/TreatmentModel";
import mongoose from "mongoose";
import { ErrorHandler, ValidationError, NotFoundError } from "@vetclinic/shared-kernel";

export class MongoTreatmentRepository implements TreatmentRepository {
  private isValidObjectId(id: string): boolean {
    if (!id || id.trim() === '') {
      return false;
    }
    return mongoose.Types.ObjectId.isValid(id);
  }

  private validateId(id: string): void {
    if (!this.isValidObjectId(id)) {
      throw new ValidationError("Invalid ID format", undefined, 'Treatment repository');
    }
  }

  async findById(id: string): Promise<Treatment | null> {
    try {
      this.validateId(id);
      
      const treatmentDoc = await TreatmentModel.findById(id).exec();
      return treatmentDoc ? this.toEntity(treatmentDoc) : null;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findById');
    }
  }

  async findByRecordId(recordId: string): Promise<Treatment[]> {
    try {
      if (!recordId || recordId.trim() === '') {
        throw new ValidationError("Record ID is required", undefined, 'Treatment repository');
      }

      const treatmentDocs = await TreatmentModel.find({ recordId })
        .sort({ date: -1 })
        .exec();
      return treatmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByRecordId');
    }
  }

  async findByName(name: string): Promise<Treatment[]> {
    try {
      if (!name || name.trim() === '') {
        throw new ValidationError("Name is required", undefined, 'Treatment repository');
      }

      const treatmentDocs = await TreatmentModel.find({ 
        name: { $regex: new RegExp(name, 'i') }
      }).exec();
      return treatmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByName');
    }
  }

  async findByCostRange(minCost: number, maxCost: number): Promise<Treatment[]> {
    try {
      if (minCost < 0 || maxCost < 0) {
        throw new ValidationError("Cost cannot be negative", undefined, 'Treatment repository');
      }

      if (minCost > maxCost) {
        throw new ValidationError("Minimum cost cannot be greater than maximum cost", undefined, 'Treatment repository');
      }

      const treatmentDocs = await TreatmentModel.find({ 
        cost: { $gte: minCost, $lte: maxCost }
      }).exec();
      return treatmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByCostRange');
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Treatment[]> {
    try {
      if (!startDate || !endDate) {
        throw new ValidationError("Start date and end date are required", undefined, 'Treatment repository');
      }

      if (startDate > endDate) {
        throw new ValidationError("Start date cannot be after end date", undefined, 'Treatment repository');
      }

      const treatmentDocs = await TreatmentModel.find({ 
        date: { $gte: startDate, $lte: endDate }
      }).exec();
      return treatmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findByDateRange');
    }
  }

  async findAll(): Promise<Treatment[]> {
    try {
      const treatmentDocs = await TreatmentModel.find().exec();
      return treatmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'findAll');
    }
  }

  async getStats(): Promise<{
    totalTreatments: number;
    totalCost: number;
    averageCost: number;
    treatmentsByRecord: Record<string, number>;
    costRange: { min: number; max: number; average: number };
  }> {
    try {
      const [totalTreatments, costStats, treatmentsByRecordAgg] = await Promise.all([
        TreatmentModel.countDocuments(),
        TreatmentModel.aggregate([
          {
            $group: {
              _id: null,
              totalCost: { $sum: '$cost' },
              averageCost: { $avg: '$cost' },
              minCost: { $min: '$cost' },
              maxCost: { $max: '$cost' }
            }
          }
        ]),
        TreatmentModel.aggregate([
          {
            $group: {
              _id: '$recordId',
              count: { $sum: 1 }
            }
          }
        ])
      ]);

      const treatmentsByRecord: Record<string, number> = {};
      treatmentsByRecordAgg.forEach(item => {
        treatmentsByRecord[item._id] = item.count;
      });

      const stats = costStats.length > 0 ? costStats[0] : {
        totalCost: 0,
        averageCost: 0,
        minCost: 0,
        maxCost: 0
      };

      return {
        totalTreatments,
        totalCost: stats.totalCost,
        averageCost: stats.averageCost,
        treatmentsByRecord,
        costRange: {
          min: stats.minCost,
          max: stats.maxCost,
          average: stats.averageCost
        }
      };
    } catch (error) {
      ErrorHandler.handleAppError(error, 'getStats');
    }
  }

  async save(treatment: Treatment): Promise<Treatment> {
    try {
      const treatmentDoc = new TreatmentModel(this.toDocument(treatment));
      const savedDoc = await treatmentDoc.save();
      return this.toEntity(savedDoc);
    } catch (error) {
      ErrorHandler.handleAppError(error, 'save');
    }
  }

  async update(treatment: Treatment): Promise<void> {
    try {
      this.validateId(treatment.id);

      await TreatmentModel.findByIdAndUpdate(
        treatment.id, 
        this.toDocument(treatment),
        { new: true, runValidators: true }
      ).exec();
    } catch (error) {
      ErrorHandler.handleAppError(error, 'update');
    }
  }

  async updateById(id: string, updateData: Partial<Treatment>): Promise<void> {
    try {
      this.validateId(id);

      const updateQuery: any = {};
      
      if (updateData.name !== undefined) {
        if (!updateData.name || updateData.name.trim() === '') {
          throw new ValidationError("Name cannot be empty", undefined, 'Treatment repository');
        }
        updateQuery.name = updateData.name;
      }

      if (updateData.description !== undefined) updateQuery.description = updateData.description;
      
      if (updateData.cost !== undefined) {
        if (updateData.cost < 0) {
          throw new ValidationError("Cost cannot be negative", undefined, 'Treatment repository');
        }
        updateQuery.cost = updateData.cost;
      }
      
      if (updateData.date !== undefined) updateQuery.date = updateData.date;
      
      if (updateData.recordId !== undefined) {
        if (!updateData.recordId || updateData.recordId.trim() === '') {
          throw new ValidationError("Record ID cannot be empty", undefined, 'Treatment repository');
        }
        updateQuery.recordId = updateData.recordId;
      }

      await TreatmentModel.findByIdAndUpdate(
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
      this.validateId(id);

      const result = await TreatmentModel.findByIdAndDelete(id).exec();
      
      if (!result) {
        throw new NotFoundError(`Treatment with ID ${id} not found`);
      }
    } catch (error) {
      ErrorHandler.handleAppError(error, 'delete');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      this.validateId(id);
      const count = await TreatmentModel.countDocuments({ _id: id }).exec();
      return count > 0;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'exists');
    }
  }

  async search(query: string): Promise<Treatment[]> {
    try {
      if (!query || query.trim() === '') {
        throw new ValidationError("Search query is required", undefined, 'Treatment repository');
      }

      const treatmentDocs = await TreatmentModel.find({
        $or: [
          { name: { $regex: new RegExp(query, 'i') } },
          { description: { $regex: new RegExp(query, 'i') } }
        ]
      }).exec();
      return treatmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'search');
    }
  }

  async getTreatmentTrend(startDate: Date, endDate: Date): Promise<{ date: string; count: number; totalCost: number }[]> {
    try {
      if (!startDate || !endDate) {
        throw new ValidationError("Start date and end date are required", undefined, 'Treatment repository');
      }

      if (startDate > endDate) {
        throw new ValidationError("Start date cannot be after end date", undefined, 'Treatment repository');
      }

      const trendAgg = await TreatmentModel.aggregate([
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
            count: { $sum: 1 },
            totalCost: { $sum: '$cost' }
          }
        },
        { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
      ]);

      return trendAgg.map(item => ({
        date: `${item._id.year}-${item._id.month.toString().padStart(2, '0')}-${item._id.day.toString().padStart(2, '0')}`,
        count: item.count,
        totalCost: item.totalCost
      }));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'getTreatmentTrend');
    }
  }

  async getCostAnalysis(): Promise<{
    totalRevenue: number;
    averageTreatmentCost: number;
    mostExpensiveTreatment: { treatment: string; cost: number };
    leastExpensiveTreatment: { treatment: string; cost: number };
    costDistribution: { range: string; count: number }[];
  }> {
    try {
      const [costStats, mostExpensive, leastExpensive, costDistribution] = await Promise.all([
        TreatmentModel.aggregate([
          {
            $group: {
              _id: null,
              totalRevenue: { $sum: '$cost' },
              averageCost: { $avg: '$cost' }
            }
          }
        ]),
        TreatmentModel.findOne().sort({ cost: -1 }).select('name cost').exec(),
        TreatmentModel.findOne().sort({ cost: 1 }).select('name cost').exec(),
        TreatmentModel.aggregate([
          {
            $bucket: {
              groupBy: '$cost',
              boundaries: [0, 50, 100, 200, 500, 1000],
              default: '1000+',
              output: {
                count: { $sum: 1 }
              }
            }
          }
        ])
      ]);

      const stats = costStats.length > 0 ? costStats[0] : { totalRevenue: 0, averageCost: 0 };

      const costDistributionFormatted = costDistribution.map(item => ({
        range: item._id === '1000+' ? '1000+' : `$${item._id}-${item._id === 1000 ? '1000+' : item.boundaries[1] - 1}`,
        count: item.count
      }));

      return {
        totalRevenue: stats.totalRevenue,
        averageTreatmentCost: stats.averageCost,
        mostExpensiveTreatment: {
          treatment: mostExpensive?.name || 'N/A',
          cost: mostExpensive?.cost || 0
        },
        leastExpensiveTreatment: {
          treatment: leastExpensive?.name || 'N/A',
          cost: leastExpensive?.cost || 0
        },
        costDistribution: costDistributionFormatted
      };
    } catch (error) {
      ErrorHandler.handleAppError(error, 'getCostAnalysis');
    }
  }

  async bulkUpdateCosts(ids: string[], cost: number): Promise<void> {
    try {
      if (!ids || ids.length === 0) {
        throw new ValidationError("IDs array cannot be empty", undefined, 'Treatment repository');
      }

      if (cost < 0) {
        throw new ValidationError("Cost cannot be negative", undefined, 'Treatment repository');
      }

      ids.forEach(id => this.validateId(id));

      await TreatmentModel.updateMany(
        { _id: { $in: ids } },
        { cost },
        { runValidators: true }
      ).exec();
    } catch (error) {
      ErrorHandler.handleAppError(error, 'bulkUpdateCosts');
    }
  }

  private toEntity(doc: any): Treatment {
    return Treatment.create({
      id: doc._id.toString(),
      recordId: doc.recordId,
      name: doc.name,
      description: doc.description,
      date: doc.date,
      cost: doc.cost,
    });
  }

  private toDocument(treatment: Treatment): any {
    return { 
      recordId: treatment.recordId,
      name: treatment.name,
      description: treatment.description,
      date: treatment.date,
      cost: treatment.cost
    };
  }
}
