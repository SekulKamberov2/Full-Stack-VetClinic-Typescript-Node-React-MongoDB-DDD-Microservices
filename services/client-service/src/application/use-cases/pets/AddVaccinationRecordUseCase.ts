import { Pet } from '../../../domain/entities/Pet';
import { PetRepository } from '../../../domain/repositories/PetRepository';
import { NotFoundError, ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class AddVaccinationRecordUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(petId: string, vaccinationRecord: {
    vaccineId: string;
    vaccine: string;
    dateAdministered: Date;
    nextDueDate: Date;
    veterinarian: string;
    lotNumber?: string;
  }): Promise<Pet> {
    try {
      const existingPet = await this.petRepository.findById(petId);
      if (!existingPet) {
        throw new NotFoundError(
          `Pet with ID ${petId} not found`,
          undefined,
          'AddVaccinationRecordUseCase'
        );
      }

      this.validateVaccinationRecord(vaccinationRecord);

      const completeVaccinationRecord = {
        ...vaccinationRecord,
        isCompleted: false
      };

      const updatedPet = existingPet.addVaccinationRecord(completeVaccinationRecord);
      await this.petRepository.save(updatedPet);

      return updatedPet;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Add vaccination record') as never;
    }
  }

  private validateVaccinationRecord(record: any): void {
    const context = 'AddVaccinationRecordUseCase';

    if (!record.vaccineId || record.vaccineId.trim() === '') {
      throw new ValidationError("Vaccine ID is required", undefined, context);
    }

    if (!record.vaccine || record.vaccine.trim() === '') {
      throw new ValidationError("Vaccine name is required", undefined, context);
    }

    if (!record.dateAdministered) {
      throw new ValidationError("Date administered is required", undefined, context);
    }

    if (!record.nextDueDate) {
      throw new ValidationError("Next due date is required", undefined, context);
    }

    if (!record.veterinarian || record.veterinarian.trim() === '') {
      throw new ValidationError("Veterinarian name is required", undefined, context);
    }

    if (record.dateAdministered > new Date()) {
      throw new ValidationError("Date administered cannot be in the future", undefined, context);
    }

    if (record.nextDueDate <= record.dateAdministered) {
      throw new ValidationError("Next due date must be after date administered", undefined, context);
    }
  }
}
