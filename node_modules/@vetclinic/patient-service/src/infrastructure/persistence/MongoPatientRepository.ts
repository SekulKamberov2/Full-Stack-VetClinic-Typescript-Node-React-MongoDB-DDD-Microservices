import { Patient, PatientProps } from '../../domain/entities/Patient';
import { PatientRepository } from '../../domain/repositories/PatientRepository';
import { PatientModel } from './models/PatientModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoPatientRepository implements PatientRepository {
  private model: typeof PatientModel;

  constructor() {
    this.model = PatientModel;
  }

  async findById(id: string): Promise<Patient | null> {
    try {
      const patientDoc = await this.model.findById(id).exec();
      return patientDoc ? this.toEntity(patientDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByOwnerId(ownerId: string): Promise<Patient[]> {
    try {
      const patientDocs = await this.model.find({ ownerId, isActive: true }).exec();
      return patientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByOwnerId');
    }
  }

  async findAll(): Promise<Patient[]> {
    try {
      const patientDocs = await this.model.find({ isActive: true }).exec();
      return patientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async findAllIncludingInactive(): Promise<Patient[]> {
    try {
      const patientDocs = await this.model.find().exec();
      return patientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAllIncludingInactive');
    }
  }

  async save(patient: Patient): Promise<Patient> {
    try {
      if (!patient.id || patient.id === '') {
        const patientDoc = new this.model(this.toDocument(patient));
        const savedDoc = await patientDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        patient.id,
        this.toDocument(patient),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Patient with ID ${patient.id} not found`,
          undefined,
          'PatientRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async update(patient: Patient): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        patient.id,
        this.toDocument(patient),
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Patient with ID ${patient.id} not found`,
          undefined,
          'PatientRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'update');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        id,
        { isActive: false, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Patient with ID ${id} not found`,
          undefined,
          'PatientRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
    }
  }

  async reactivate(id: string): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        id,
        { isActive: true, updatedAt: new Date() },
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Patient with ID ${id} not found`,
          undefined,
          'PatientRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'reactivate');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.model.countDocuments({ _id: id }).exec();
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error, 'exists');
    }
  }

  async existsByNameAndOwner(name: string, ownerId: string): Promise<boolean> {
    try {
      const count = await this.model.countDocuments({ 
        name, 
        ownerId, 
        isActive: true 
      }).exec();
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error, 'existsByNameAndOwner');
    }
  }

  async searchPatients(query: string, ownerId?: string): Promise<Patient[]> {
    try {
      const filter: any = { 
        isActive: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { species: { $regex: query, $options: 'i' } },
          { breed: { $regex: query, $options: 'i' } }
        ]
      };
      
      if (ownerId) {
        filter.ownerId = ownerId;
      }

      const patientDocs = await this.model.find(filter).exec();
      return patientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'searchPatients');
    }
  }

  async getPatientStats(ownerId?: string): Promise<{
    totalPatients: number;
    activePatients: number;
    patientsBySpecies: Record<string, number>;
  }> {
    try {
      const filter: any = { isActive: true };
      if (ownerId) {
        filter.ownerId = ownerId;
      }

      const totalPatients = await this.model.countDocuments(filter);
      const activePatients = await this.model.countDocuments(filter);
      
      const patientsBySpeciesAgg = await this.model.aggregate([
        { $match: filter },
        { $group: { _id: '$species', count: { $sum: 1 } } }
      ]);
      
      const patientsBySpecies: Record<string, number> = {};
      patientsBySpeciesAgg.forEach(item => {
        patientsBySpecies[item._id] = item.count;
      });

      return {
        totalPatients,
        activePatients,
        patientsBySpecies
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getPatientStats');
    }
  }

  async findBySpecies(species: string): Promise<Patient[]> {
    try {
      const patientDocs = await this.model.find({ 
        species, 
        isActive: true 
      }).exec();
      return patientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findBySpecies');
    }
  }

  async findByBreed(breed: string): Promise<Patient[]> {
    try {
      const patientDocs = await this.model.find({ 
        breed, 
        isActive: true 
      }).exec();
      return patientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByBreed');
    }
  }

  private toEntity(doc: any): Patient {
    const props: PatientProps = {
      id: doc._id.toString(),
      name: doc.name,
      species: doc.species,
      breed: doc.breed,
      dateOfBirth: doc.dateOfBirth,
      medicalAlerts: doc.medicalAlerts,
      ownerId: doc.ownerId,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return Patient.create(props);  
  }

  private toDocument(patient: Patient): Partial<any> { 
    return {
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      dateOfBirth: patient.dateOfBirth,
      medicalAlerts: patient.medicalAlerts,
      ownerId: patient.ownerId,
      isActive: patient.isActive,
      updatedAt: new Date()
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoPatientRepository.${operation}`;
    
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
    
    if (this.isDuplicateKeyError(error)) {
      throw new AppError(
        'Duplicate patient detected',
        'DUPLICATE_PATIENT',
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

  private isDuplicateKeyError(error: unknown): boolean {
    return error instanceof Error && 
           'code' in error && 
           error.code === 11000;
  }
}
