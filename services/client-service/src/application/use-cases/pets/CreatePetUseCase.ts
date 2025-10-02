import { Pet } from '../../../domain/entities/Pet';
import { PetRepository } from '../../../domain/repositories/PetRepository';
import { ClientRepository } from '../../../domain/repositories/ClientRepository';
import { ValidationError, NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class CreatePetUseCase {
  constructor(
    private petRepository: PetRepository,
    private clientRepository: ClientRepository
  ) {}

  async execute(petData: {
    name: string;
    species: string;
    breed: string;
    age: number;
    dateOfBirth: Date;
    weight: number;
    color: string;
    gender: 'Male' | 'Female';
    microchipNumber?: string;
    insuranceNumber?: string;
    dietaryRestrictions: string[];
    clientId: string;
  }): Promise<Pet> {
    try {
      this.validatePetData(petData);

      const client = await this.clientRepository.findById(petData.clientId);
      if (!client) {
        throw new NotFoundError(
          `Client with ID ${petData.clientId} not found`,
          undefined,
          'CreatePetUseCase'
        );
      }

      const completePetData = {
        ...petData,
        medicalHistory: [],
        vaccinationRecords: [],
        awards: [],
        isActive: true
      };

      const pet = Pet.create(completePetData);
      const savedPet = await this.petRepository.save(pet);

      await this.linkPetToClient(petData.clientId, savedPet._id);

      return savedPet;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Create pet') as never;
    }
  }

  private async linkPetToClient(clientId: string, petId: string): Promise<void> {
    try {
      if (typeof (this.clientRepository as any).addPetToClient === 'function') {
        await (this.clientRepository as any).addPetToClient(clientId, petId);
      } else {
        await this.updateClientPetsArray(clientId, petId);
      }
      console.log(`Successfully linked pet ${petId} to client ${clientId}`);
    } catch (error) {
      console.error('Error linking pet to client:', error);
    }
  }

  private async updateClientPetsArray(clientId: string, petId: string): Promise<void> {
    try {
      const client = await this.clientRepository.findById(clientId);
      if (!client) {
        console.error(`Client ${clientId} not found when linking pet`);
        return;
      }

      const petExists = client.pets.some(pet => pet._id === petId);
      if (!petExists) {
        client.pets.push({ _id: petId } as any);
        await this.clientRepository.save(client);
        console.log(`Added pet ${petId} to client ${clientId}'s pets array`);
      } else {
        console.log(`ℹPet ${petId} already exists in client ${clientId}'s pets array`);
      }
    } catch (error) {
      console.error('Error updating client pets array:', error);
      throw error;
    }
  }

  private validatePetData(petData: any): void {
    const context = 'CreatePetUseCase';

    if (!petData.name || petData.name.trim() === '') {
      throw new ValidationError("Pet name is required", undefined, context);
    }

    if (!petData.species || petData.species.trim() === '') {
      throw new ValidationError("Species is required", undefined, context);
    }

    if (!petData.breed || petData.breed.trim() === '') {
      throw new ValidationError("Breed is required", undefined, context);
    }

    if (petData.age < 0 || petData.age > 50) {
      throw new ValidationError("Age must be between 0 and 50", undefined, context);
    }

    if (petData.weight <= 0) {
      throw new ValidationError("Weight must be positive", undefined, context);
    }

    if (!petData.color || petData.color.trim() === '') {
      throw new ValidationError("Color is required", undefined, context);
    }

    if (!petData.gender || !['Male', 'Female'].includes(petData.gender)) {
      throw new ValidationError("Gender must be either 'Male' or 'Female'", undefined, context);
    }

    if (!petData.clientId) {
      throw new ValidationError("Client ID is required", undefined, context);
    }

    if (petData.dateOfBirth) {
      const dob = new Date(petData.dateOfBirth);
      if (isNaN(dob.getTime())) {
        throw new ValidationError("Invalid date of birth", undefined, context);
      }
    }

    if (petData.dietaryRestrictions && !Array.isArray(petData.dietaryRestrictions)) {
      throw new ValidationError("Dietary restrictions must be an array", undefined, context);
    }
  }
}