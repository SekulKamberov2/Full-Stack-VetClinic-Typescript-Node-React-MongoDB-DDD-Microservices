import { Pet, PetProps } from '../../domain/entities/Pet';
import { PetRepository } from '../../domain/repositories/PetRepository';
import { PetModel } from './models/PetModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoPetRepository implements PetRepository {
  private model: typeof PetModel;

  constructor() {
    this.model = PetModel;
  }

  async findById(id: string): Promise<Pet | null> {
    try {
      const petDoc = await this.model.findById(id).exec();
      return petDoc ? this.toEntity(petDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByClientId(clientId: string): Promise<Pet[]> {
    try {
      const petDocs = await this.model.find({ clientId, isActive: true }).exec();
      return petDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByClientId');
    }
  }

  async findByName(name: string): Promise<Pet[]> {
    try {
      const petDocs = await this.model.find({ 
        name: { $regex: name, $options: 'i' },
        isActive: true 
      }).exec();
      return petDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByName');
    }
  }

  async findBySpecies(species: string): Promise<Pet[]> {
    try {
      const petDocs = await this.model.find({ 
        species: { $regex: species, $options: 'i' },
        isActive: true 
      }).exec();
      return petDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findBySpecies');
    }
  }

  async save(pet: Pet): Promise<Pet> {
    try {
      if (!pet._id || pet._id === '') {
        const petDoc = new this.model(this.toDocument(pet));
        const savedDoc = await petDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        pet._id,
        this.toDocument(pet),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Pet with ID ${pet._id} not found`,
          undefined,
          'PetRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async update(pet: Pet): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        pet._id,
        this.toDocument(pet),
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Pet with ID ${pet._id} not found`,
          undefined,
          'PetRepository'
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
          `Pet with ID ${id} not found`,
          undefined,
          'PetRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
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

  async searchPets(query: string): Promise<Pet[]> {
    try {
      const petDocs = await this.model.find({
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { species: { $regex: query, $options: 'i' } },
          { breed: { $regex: query, $options: 'i' } }
        ],
        isActive: true
      }).exec();
      
      return petDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'searchPets');
    }
  }

  async getPetStats(): Promise<{
    totalPets: number;
    activePets: number;
    petsBySpecies: Record<string, number>;
    averageAge: number;
  }> {
    try {
      const totalPets = await this.model.countDocuments();
      const activePets = await this.model.countDocuments({ isActive: true });
      
      const petsBySpeciesAgg = await this.model.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: '$species', count: { $sum: 1 } } }
      ]);
      
      const averageAgeAgg = await this.model.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, averageAge: { $avg: '$age' } } }
      ]);
      
      const petsBySpecies: Record<string, number> = {};
      petsBySpeciesAgg.forEach(item => {
        petsBySpecies[item._id] = item.count;
      });

      const averageAge = averageAgeAgg.length > 0 ? averageAgeAgg[0].averageAge : 0;

      return {
        totalPets,
        activePets,
        petsBySpecies,
        averageAge
      };
    } catch (error) {
      this.handleDatabaseError(error, 'getPetStats');
    }
  }

  async findAll(): Promise<Pet[]> {
    try {
        const petDocs = await this.model.find({ isActive: true }).exec();
        return petDocs.map(doc => this.toEntity(doc));
    } catch (error) {
        this.handleDatabaseError(error, 'findAll');
    }
    }

  private toEntity(doc: any): Pet {
    const props: PetProps = {
        _id: doc._id.toString(),
        name: doc.name,
        species: doc.species,
        breed: doc.breed,
        age: doc.age,
        dateOfBirth: doc.dateOfBirth,
        weight: doc.weight,
        color: doc.color,
        gender: doc.gender,
        profileImage: doc.profileImage,
        microchipNumber: doc.microchipNumber,
        insuranceNumber: doc.insuranceNumber,
        dietaryRestrictions: doc.dietaryRestrictions || [],
        vaccinationRecords: doc.vaccinationRecords || [],
        awards: doc.awards || [],
        isActive: doc.isActive,
        clientId: doc.clientId.toString(),
        createdAt: doc.createdAt,
        updatedAt: doc.updatedAt,
        medicalHistory: []
    };
    return Pet.create(props);
  }

  private toDocument(pet: Pet): Partial<any> {
    return {
      name: pet.name,
      species: pet.species,
      breed: pet.breed,
      age: pet.age,
      dateOfBirth: pet.dateOfBirth,
      weight: pet.weight,
      color: pet.color,
      gender: pet.gender,
      profileImage: pet.profileImage,
      microchipNumber: pet.microchipNumber,
      insuranceNumber: pet.insuranceNumber,
      dietaryRestrictions: pet.dietaryRestrictions,
      vaccinationRecords: pet.vaccinationRecords,
      awards: pet.awards,
      isActive: pet.isActive,
      clientId: pet.clientId,
      updatedAt: new Date()
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoPetRepository.${operation}`;
    
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
        'Duplicate pet detected',
        'DUPLICATE_PET',
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
