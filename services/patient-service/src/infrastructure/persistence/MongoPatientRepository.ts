import { PatientStats } from 'src/application/use-cases/Patients/GetPatientStatsUseCase';
import { Patient, PatientProps, PatientStatus } from '../../domain/entities/Patient';
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
      
      const existingPatient = await this.model.findById(patient.id).exec();
      if (existingPatient) {
        return this.toEntity(existingPatient);
      } else {
        const patientDoc = new this.model({
          ...this.toDocument(patient),
          _id: patient.id 
        });
        const savedDoc = await patientDoc.save();
        return this.toEntity(savedDoc);
      }
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

  async getPatientStats(ownerId?: string): Promise<PatientStats> {
    try {
      const filter: any = { isActive: true };
      const allFilter: any = {};
      
      if (ownerId) {
        filter.ownerId = ownerId;
        allFilter.ownerId = ownerId;
      }
 
      const totalPatients = await this.model.countDocuments(allFilter);
      const activePatients = await this.model.countDocuments(filter);
      const inactivePatients = totalPatients - activePatients;
 
      const patientsBySpeciesAgg = await this.model.aggregate([
        { $match: allFilter },
        { $group: { _id: '$species', count: { $sum: 1 } } }
      ]);
      
      const patientsBySpecies: Record<string, number> = {};
      patientsBySpeciesAgg.forEach(item => {
        patientsBySpecies[item._id] = item.count;
      });
 
      const patientsByStatusAgg = await this.model.aggregate([
        { $match: allFilter },
        { $group: { _id: '$status', count: { $sum: 1 } } }
      ]);
      
      const patientsByStatus: Record<string, number> = {};
      patientsByStatusAgg.forEach(item => {
        patientsByStatus[item._id] = item.count;
      });
 
      const patientsByGenderAgg = await this.model.aggregate([
        { $match: allFilter },
        { $group: { _id: '$sex', count: { $sum: 1 } } }
      ]);
      
      const patientsByGender: Record<string, number> = {
        'Male': 0,
        'Female': 0,
        'Unknown': 0
      };
      
      patientsByGenderAgg.forEach(item => {
        const normalizedSex = this.normalizeSexForStats(item._id);
        patientsByGender[normalizedSex] = (patientsByGender[normalizedSex] || 0) + item.count;
      });
  
      const patientsWithDob = await this.model.find({
        ...allFilter,
        dateOfBirth: { $exists: true, $ne: null }
      }).select('dateOfBirth').exec();
      
      let averageAge = 0;
      if (patientsWithDob.length > 0) {
        const totalAge = patientsWithDob.reduce((sum, patient) => {
          const age = this.calculateAge(patient.dateOfBirth);
          return sum + age;
        }, 0);
        averageAge = Math.round((totalAge / patientsWithDob.length) * 10) / 10;
      }
  
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentPatients = await this.model.countDocuments({
        ...allFilter,
        createdAt: { $gte: thirtyDaysAgo }
      });
  
      const speciesDistribution = Object.entries(patientsBySpecies)
        .map(([species, count]) => ({
          species,
          count,
          percentage: totalPatients > 0 ? Math.round((count / totalPatients) * 1000) / 10 : 0
        }))
        .sort((a, b) => b.count - a.count);

      return {
        totalPatients,
        activePatients,
        inactivePatients,
        patientsBySpecies,
        patientsByStatus,
        patientsByGender,
        averageAge,
        recentPatients,
        speciesDistribution
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getPatientStats');
    }
  }

  private normalizeSexForStats(sex: string): string {
    if (!sex) return 'Unknown';
    
    const lowerSex = sex.toLowerCase().trim();
    if (lowerSex.includes('male') && !lowerSex.includes('female')) {
      return 'Male';
    } else if (lowerSex.includes('female')) {
      return 'Female';
    } else {
      return 'Unknown';
    }
  }

  private calculateAge(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
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
      color: doc.color,
      sex: doc.sex,
      microchipNumber: doc.microchipNumber || "",
      profilePictureUrl: doc.profilePictureUrl || "",
      status: doc.status,
      ownerId: doc.ownerId,
      medicalAlerts: doc.medicalAlerts || [],
      isActive: doc.isActive !== undefined ? doc.isActive : true,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return Patient.create(props);
  }

  async findByStatus(status: PatientStatus): Promise<Patient[]> {
    try {
      const patientDocs = await this.model.find({ 
        status, 
        isActive: true 
      }).exec();
      return patientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByStatus');
    }
  }

  async search(query: string, ownerId?: string): Promise<Patient[]> {
    try {
      const filter: any = { 
        isActive: true,
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { species: { $regex: query, $options: 'i' } },
          { breed: { $regex: query, $options: 'i' } },
          { color: { $regex: query, $options: 'i' } },
          { microchipNumber: { $regex: query, $options: 'i' } }
        ]
      };
      
      if (ownerId) {
        filter.ownerId = ownerId;
      }

      const patientDocs = await this.model.find(filter).exec();
      return patientDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'search');
    }
  }

  async findByMicrochip(microchipNumber: string): Promise<Patient | null> {
    try {
      const patientDoc = await this.model.findOne({ 
        microchipNumber,
        isActive: true 
      }).exec();
      return patientDoc ? this.toEntity(patientDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findByMicrochip');
    }
  }

  private toDocument(patient: Patient): Partial<any> { 
    return {
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      dateOfBirth: patient.dateOfBirth,
      color: patient.color,
      sex: patient.sex,
      microchipNumber: patient.microchipNumber,
      profilePictureUrl: patient.profilePictureUrl,
      status: patient.status,
      ownerId: patient.ownerId,
      medicalAlerts: patient.medicalAlerts,
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
