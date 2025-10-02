import { Pet } from '../../../domain/entities/Pet';
import { PetRepository } from '../../../domain/repositories/PetRepository';
import { NotFoundError, ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class UpdatePetUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(petId: string, updateData: {
    name?: string;
    species?: string;
    breed?: string;
    age?: number;
    dateOfBirth?: Date;
    weight?: number;
    color?: string;
    gender?: 'Male' | 'Female';
    microchipNumber?: string;
    insuranceNumber?: string;
    dietaryRestrictions?: string[];
  }): Promise<Pet> {
    try {
      const existingPet = await this.petRepository.findById(petId);
      if (!existingPet) {
        throw new NotFoundError(
          `Pet with ID ${petId} not found`,
          undefined,
          'UpdatePetUseCase'
        );
      }

      this.validateUpdateData(updateData);

      const updatedPet = existingPet.update(updateData);
      await this.petRepository.save(updatedPet);

      return updatedPet;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Update pet') as never;
    }
  }

  private validateUpdateData(updateData: any): void {
    const context = 'UpdatePetUseCase';

    if (updateData.age !== undefined && (updateData.age < 0 || updateData.age > 50)) {
      throw new ValidationError("Age must be between 0 and 50", undefined, context);
    }

    if (updateData.weight !== undefined && updateData.weight <= 0) {
      throw new ValidationError("Weight must be positive", undefined, context);
    }

    if (updateData.gender !== undefined && !['Male', 'Female'].includes(updateData.gender)) {
      throw new ValidationError("Gender must be 'Male' or 'Female'", undefined, context);
    }
  }
}
