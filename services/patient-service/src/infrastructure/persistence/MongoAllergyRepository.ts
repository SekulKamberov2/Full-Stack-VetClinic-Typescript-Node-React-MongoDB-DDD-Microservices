import { Allergy, AllergyProps, AllergySeverity } from '../../domain/entities/Allergy';
import { AllergyRepository } from '../../domain/repositories/AllergyRepository';
import { AllergyModel } from './models/AllergyModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoAllergyRepository implements AllergyRepository {
  private model: typeof AllergyModel;

  constructor() {
    this.model = AllergyModel;
  }

  async findById(id: string): Promise<Allergy | null> {
    try {
      const allergyDoc = await this.model.findById(id).exec();
      return allergyDoc ? this.toEntity(allergyDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByPatientId(patientId: string): Promise<Allergy[]> {
    try {
      const allergyDocs = await this.model.find({ patientId }).sort({ firstObserved: -1 }).exec();
      return allergyDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByPatientId');
    }
  }

  async findActiveByPatientId(patientId: string): Promise<Allergy[]> {
    try {
      const allergyDocs = await this.model.find({ patientId, isActive: true }).sort({ firstObserved: -1 }).exec();
      return allergyDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findActiveByPatientId');
    }
  }

  async findBySeverity(severity: string): Promise<Allergy[]> {
    try {
      const allergyDocs = await this.model.find({ severity, isActive: true }).exec();
      return allergyDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findBySeverity');
    }
  }

  async save(allergy: Allergy): Promise<Allergy> {
    try {
      if (!allergy.id || allergy.id === '') {
        const allergyDoc = new this.model(this.toDocument(allergy));
        const savedDoc = await allergyDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        allergy.id,
        this.toDocument(allergy),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Allergy with ID ${allergy.id} not found`,
          undefined,
          'AllergyRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async findAll(): Promise<Allergy[]> {
    try {
      const allergyDocs = await this.model.find().exec();
      return allergyDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async update(allergy: Allergy): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        allergy.id,
        this.toDocument(allergy),
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Allergy with ID ${allergy.id} not found`,
          undefined,
          'AllergyRepository'
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
          `Allergy with ID ${id} not found`,
          undefined,
          'AllergyRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
    }
  }

  private toEntity(doc: any): Allergy {
    const props: AllergyProps = {
      id: doc._id.toString(),
      patientId: doc.patientId,
      allergen: doc.allergen,
      reaction: doc.reaction,
      severity: doc.severity as AllergySeverity,
      firstObserved: doc.firstObserved,
      isActive: doc.isActive,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return Allergy.create(props);
  }

  private toDocument(allergy: Allergy): Partial<any> {
    return {
      patientId: allergy.patientId,
      allergen: allergy.allergen,
      reaction: allergy.reaction,
      severity: allergy.severity,
      firstObserved: allergy.firstObserved,
      isActive: allergy.isActive,
      notes: allergy.notes,
      updatedAt: new Date()
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoAllergyRepository.${operation}`;
    
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
