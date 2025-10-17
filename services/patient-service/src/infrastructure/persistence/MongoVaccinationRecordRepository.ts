import { VaccinationStats } from 'src/application/use-cases/Vaccinations/GetVaccinationStatsUseCase';
import { VaccinationRecord, VaccinationRecordProps } from '../../domain/entities/VaccinationRecord';
import { VaccinationRecordRepository } from '../../domain/repositories/VaccinationRecordRepository';
import { VaccinationRecordModel } from './models/VaccinationRecordModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoVaccinationRecordRepository implements VaccinationRecordRepository {
  private model: typeof VaccinationRecordModel;

  constructor() {
    this.model = VaccinationRecordModel;
  }

  async findById(id: string): Promise<VaccinationRecord | null> {
    try {
      const vaccinationDoc = await this.model.findById(id).exec();
      return vaccinationDoc ? this.toEntity(vaccinationDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByPatientId(patientId: string): Promise<VaccinationRecord[]> {
    try {
      const vaccinationDocs = await this.model.find({ patientId }).sort({ dateAdministered: -1 }).exec();
      return vaccinationDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByPatientId');
    }
  }

  async findDueVaccinations(): Promise<VaccinationRecord[]> {
    try {
      const vaccinationDocs = await this.model.find({
        nextDueDate: { $lte: new Date() }
      }).sort({ nextDueDate: 1 }).exec();
      return vaccinationDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findDueVaccinations');
    }
  }

  async findOverdueVaccinations(): Promise<VaccinationRecord[]> {
    try {
      const overdueDate = new Date();
      overdueDate.setDate(overdueDate.getDate() - 30);

      const vaccinationDocs = await this.model.find({
        nextDueDate: { $lte: overdueDate }
      }).sort({ nextDueDate: 1 }).exec();
      return vaccinationDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findOverdueVaccinations');
    }
  }

  async findByVaccineName(vaccineName: string): Promise<VaccinationRecord[]> {
    try {
      const vaccinationDocs = await this.model.find({ 
        vaccineName: { $regex: vaccineName, $options: 'i' } 
      }).exec();
      return vaccinationDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByVaccineName');
    }
  }

  async save(vaccination: VaccinationRecord): Promise<VaccinationRecord> {
    try {
      if (!vaccination.id || vaccination.id === '') {
        const vaccinationDoc = new this.model(this.toDocument(vaccination));
        const savedDoc = await vaccinationDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        vaccination.id,
        this.toDocument(vaccination),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Vaccination record with ID ${vaccination.id} not found`,
          undefined,
          'VaccinationRecordRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async update(vaccination: VaccinationRecord): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        vaccination.id,
        this.toDocument(vaccination),
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Vaccination record with ID ${vaccination.id} not found`,
          undefined,
          'VaccinationRecordRepository'
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
          `Vaccination record with ID ${id} not found`,
          undefined,
          'VaccinationRecordRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
    }
  }

    async findAll(): Promise<VaccinationRecord[]> {
      try {
        const vaccinationDocs = await this.model.find().exec();
        return vaccinationDocs.map(doc => this.toEntity(doc));
      } catch (error) {
        this.handleDatabaseError(error, 'findAll');
      }
    }

  async getVaccinationStats(): Promise<VaccinationStats> {
    try {
      const [
        totalVaccinations,
        dueVaccinations,
        overdueVaccinations,
        vaccinationsByTypeAgg
      ] = await Promise.all([
        this.model.countDocuments(),
        this.model.countDocuments({ 
          nextDueDate: { $lte: new Date(), $gt: new Date(0) } 
        }),
        this.model.countDocuments({ 
          nextDueDate: { $lt: new Date() } 
        }),
        this.model.aggregate([
          { $group: { _id: '$vaccineName', count: { $sum: 1 } } }
        ])
      ]);

      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const upcomingDueVaccinations = await this.model.countDocuments({
        nextDueDate: { 
          $lte: thirtyDaysFromNow,
          $gt: new Date()
        }
      });

      const vaccinationsByType: Record<string, number> = {};
      vaccinationsByTypeAgg.forEach(item => {
        vaccinationsByType[item._id] = item.count;
      });

      return {
        totalVaccinations,
        dueVaccinations,
        overdueVaccinations,
        vaccinationsByType,
        upcomingDueVaccinations
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getVaccinationStats');
    }
  }

  private toEntity(doc: any): VaccinationRecord {
    const props: VaccinationRecordProps = {
      id: doc._id.toString(),
      patientId: doc.patientId,
      vaccineName: doc.vaccineName,
      dateAdministered: doc.dateAdministered,
      nextDueDate: doc.nextDueDate,
      administeredBy: doc.administeredBy,
      lotNumber: doc.lotNumber,
      manufacturer: doc.manufacturer,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return VaccinationRecord.create(props);
  }

  private toDocument(vaccination: VaccinationRecord): Partial<any> {
    return {
      patientId: vaccination.patientId,
      vaccineName: vaccination.vaccineName,
      dateAdministered: vaccination.dateAdministered,
      nextDueDate: vaccination.nextDueDate,
      administeredBy: vaccination.administeredBy,
      lotNumber: vaccination.lotNumber,
      manufacturer: vaccination.manufacturer,
      notes: vaccination.notes,
      updatedAt: new Date()
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoVaccinationRecordRepository.${operation}`;
    
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
