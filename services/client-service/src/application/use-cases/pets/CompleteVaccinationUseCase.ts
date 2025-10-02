import { Pet } from '../../../domain/entities/Pet';
import { PetRepository } from '../../../domain/repositories/PetRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class CompleteVaccinationUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(petId: string, vaccineId: string): Promise<Pet> {
    try {
      const existingPet = await this.petRepository.findById(petId);
      if (!existingPet) {
        throw new NotFoundError(
          `Pet with ID ${petId} not found`,
          undefined,
          'CompleteVaccinationUseCase'
        );
      }
 
      const vaccineExists = existingPet.vaccinationRecords.some(
        record => record.vaccineId === vaccineId
      );
      
      if (!vaccineExists) {
        throw new NotFoundError(
          `Vaccine with ID ${vaccineId} not found for pet ${petId}`,
          undefined,
          'CompleteVaccinationUseCase'
        );
      }

      const updatedPet = existingPet.completeVaccination(vaccineId);
      await this.petRepository.save(updatedPet);

      return updatedPet;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Complete vaccination') as never;
    }
  }
}
