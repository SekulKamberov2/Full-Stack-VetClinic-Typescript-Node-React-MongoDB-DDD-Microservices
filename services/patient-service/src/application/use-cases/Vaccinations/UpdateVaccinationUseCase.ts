import { VaccinationRecord } from '../../../domain/entities/VaccinationRecord';
import { VaccinationRecordRepository } from '../../../domain/repositories/VaccinationRecordRepository';
import { ValidationError, NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class UpdateVaccinationUseCase {
  constructor(private vaccinationRepository: VaccinationRecordRepository) {}

  async execute(id: string, vaccinationData: Partial<{
    vaccineName: string;
    dateAdministered: Date;
    nextDueDate: Date;
    administeredBy: string;
    lotNumber?: string;
    manufacturer?: string;
    notes?: string;
  }>): Promise<VaccinationRecord> {
    try {
      this.validateVaccinationData(vaccinationData);
      
      const existingVaccination = await this.vaccinationRepository.findById(id);
      if (!existingVaccination) {
        throw new NotFoundError(
          `Vaccination record with ID ${id} not found`,
          undefined,
          'UpdateVaccinationUseCase'
        );
      }

      const updatedVaccination = existingVaccination.update(vaccinationData);
      await this.vaccinationRepository.update(updatedVaccination);
      return updatedVaccination;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Update vaccination') as never;
    }
  }

  private validateVaccinationData(vaccinationData: any): void {
    const context = 'UpdateVaccinationUseCase';

    if (vaccinationData.vaccineName !== undefined && (!vaccinationData.vaccineName || vaccinationData.vaccineName.trim() === '')) {
      throw new ValidationError("Vaccine name cannot be empty", undefined, context);
    }

    if (vaccinationData.dateAdministered !== undefined && !(vaccinationData.dateAdministered instanceof Date)) {
      throw new ValidationError("Date administered must be a valid date", undefined, context);
    }

    if (vaccinationData.nextDueDate !== undefined && !(vaccinationData.nextDueDate instanceof Date)) {
      throw new ValidationError("Next due date must be a valid date", undefined, context);
    }

    if (vaccinationData.dateAdministered !== undefined && vaccinationData.nextDueDate !== undefined) {
      if (vaccinationData.nextDueDate <= vaccinationData.dateAdministered) {
        throw new ValidationError("Next due date must be after date administered", undefined, context);
      }
    }

    if (vaccinationData.administeredBy !== undefined && (!vaccinationData.administeredBy || vaccinationData.administeredBy.trim() === '')) {
      throw new ValidationError("Administered by cannot be empty", undefined, context);
    }
  }
}
