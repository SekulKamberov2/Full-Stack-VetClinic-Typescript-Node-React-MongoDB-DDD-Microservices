import { Visit, VisitProps, VisitStatus } from '../../domain/entities/Visit';
import { VisitRepository } from '../../domain/repositories/VisitRepository';
import { VisitModel } from './models/VisitModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoVisitRepository implements VisitRepository {
  private model: typeof VisitModel;

  constructor() {
    this.model = VisitModel;
  }

  async findById(id: string): Promise<Visit | null> {
    try {
      const visitDoc = await this.model.findById(id).exec();
      return visitDoc ? this.toEntity(visitDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByPatientId(patientId: string): Promise<Visit[]> {
    try {
      const visitDocs = await this.model.find({ patientId }).sort({ scheduledDateTime: -1 }).exec();
      return visitDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByPatientId');
    }
  }

  async findByVeterinarianId(veterinarianId: string): Promise<Visit[]> {
    try {
      const visitDocs = await this.model.find({ assignedVeterinarianId: veterinarianId }).sort({ scheduledDateTime: -1 }).exec();
      return visitDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByVeterinarianId');
    }
  }

  async findByStatus(status: string): Promise<Visit[]> {
    try {
      const visitDocs = await this.model.find({ status }).sort({ scheduledDateTime: -1 }).exec();
      return visitDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByStatus');
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Visit[]> {
    try {
      const visitDocs = await this.model.find({
        scheduledDateTime: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ scheduledDateTime: 1 }).exec();
      return visitDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByDateRange');
    }
  }

  async findAll(): Promise<Visit[]> {
    try {
      const visitDocs = await this.model.find().exec();
      return visitDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async findUpcomingVisits(days: number = 7): Promise<Visit[]> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);

      const visitDocs = await this.model.find({
        scheduledDateTime: {
          $gte: startDate,
          $lte: endDate
        },
        status: { $in: ['scheduled', 'checked_in'] }
      }).sort({ scheduledDateTime: 1 }).exec();
      return visitDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findUpcomingVisits');
    }
  }

  async findOverdueVisits(): Promise<Visit[]> {
    try {
      const visitDocs = await this.model.find({
        scheduledDateTime: { $lt: new Date() },
        status: 'scheduled'
      }).sort({ scheduledDateTime: 1 }).exec();
      return visitDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findOverdueVisits');
    }
  }

  async save(visit: Visit): Promise<Visit> {
    try {
      if (!visit.id || visit.id === '') {
        const visitDoc = new this.model(this.toDocument(visit));
        const savedDoc = await visitDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        visit.id,
        this.toDocument(visit),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Visit with ID ${visit.id} not found`,
          undefined,
          'VisitRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async update(visit: Visit): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        visit.id,
        this.toDocument(visit),
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Visit with ID ${visit.id} not found`,
          undefined,
          'VisitRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'update');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundError(
          `Visit with ID ${id} not found`,
          undefined,
          'VisitRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
    }
  }

  async getVisitStats(): Promise<{
    totalVisits: number;
    visitsByStatus: Record<string, number>;
    visitsByType: Record<string, number>;
  }> {
    try {
      const totalVisits = await this.model.countDocuments();
      
      const visitsByStatusAgg = await this.model.aggregate([
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      const visitsByTypeAgg = await this.model.aggregate([
        { $group: { _id: '$type', count: { $sum: 1 } } }
      ]);
      
      const visitsByStatus: Record<string, number> = {};
      visitsByStatusAgg.forEach(item => {
        visitsByStatus[item._id] = item.count;
      });
      
      const visitsByType: Record<string, number> = {};
      visitsByTypeAgg.forEach(item => {
        visitsByType[item._id] = item.count;
      });

      return {
        totalVisits,
        visitsByStatus,
        visitsByType
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getVisitStats');
    }
  }

  private toEntity(doc: any): Visit {
    const props: VisitProps = {
      id: doc._id.toString(),
      patientId: doc.patientId,
      scheduledDateTime: doc.scheduledDateTime,
      actualDateTime: doc.actualDateTime,
      status: doc.status as VisitStatus,
      type: doc.type,
      chiefComplaint: doc.chiefComplaint,
      assignedVeterinarianId: doc.assignedVeterinarianId,
      checkinTime: doc.checkinTime,
      checkoutTime: doc.checkoutTime,
      notes: doc.notes,
      diagnosis: doc.diagnosis,
      treatment: doc.treatment,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return Visit.create(props);
  }

  private toDocument(visit: Visit): Partial<any> {
    return {
      patientId: visit.patientId,
      scheduledDateTime: visit.scheduledDateTime,
      actualDateTime: visit.actualDateTime,
      status: visit.status,
      type: visit.type,
      chiefComplaint: visit.chiefComplaint,
      assignedVeterinarianId: visit.assignedVeterinarianId,
      checkinTime: visit.checkinTime,
      checkoutTime: visit.checkoutTime,
      notes: visit.notes,
      diagnosis: visit.diagnosis,
      treatment: visit.treatment,
      updatedAt: new Date()
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoVisitRepository.${operation}`;
    
    if (AppError.isAppError(error)) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ValidationError(
        `Database validation failed: ${error.message}`,
        error,
        context
      );
    }
    
    if (error instanceof Error && error.name === 'CastError') {
      throw new ValidationError(
        'Invalid ID format',
        error,
        context
      );
    }
    
    throw new AppError(
      `Database operation failed: ${operation}`,
      'DATABASE_OPERATION_FAILED',
      error,
      context
    );
  }
}
