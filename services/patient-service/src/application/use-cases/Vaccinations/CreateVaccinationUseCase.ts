import { VaccinationRecord, VaccinationRecordProps } from '../../../domain/entities/VaccinationRecord';
import { VaccinationRecordRepository } from '../../../domain/repositories/VaccinationRecordRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class CreateVaccinationUseCase {
  constructor(private vaccinationRepository: VaccinationRecordRepository) {}

  async execute(vaccinationData: Omit<VaccinationRecordProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<VaccinationRecord> {
    try {
      const processedData = this.processVaccinationData(vaccinationData);
      this.validateVaccinationData(processedData);

      const vaccination = VaccinationRecord.create(processedData);
      return await this.vaccinationRepository.save(vaccination);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Create vaccination record') as never;
    }
  }

  private processVaccinationData(vaccinationData: any): any {
    const processed = { ...vaccinationData };
    
    if (vaccinationData.dateAdministered) {
      processed.dateAdministered = new Date(vaccinationData.dateAdministered);
    }
    
    if (vaccinationData.nextDueDate) {
      processed.nextDueDate = new Date(vaccinationData.nextDueDate);
    }
    
    return processed;
  }

  private validateVaccinationData(vaccinationData: any): void {
    const context = 'CreateVaccinationUseCase';

    if (!vaccinationData.patientId || vaccinationData.patientId.trim() === '') {
      throw new ValidationError("Patient ID is required", undefined, context);
    }

    if (!vaccinationData.vaccineName || vaccinationData.vaccineName.trim() === '') {
      throw new ValidationError("Vaccine name is required", undefined, context);
    }

    const commonVaccines = [
      'Rabies', 'Distemper', 'Parvovirus', 'Adenovirus', 'Parainfluenza',
      'Bordetella', 'Leptospirosis', 'Lyme', 'Influenza', 'FVRCP',
      'Feline Leukemia', 'FIV', 'Other'
    ];
    
    if (!commonVaccines.includes(vaccinationData.vaccineName)) {
      console.warn(`Uncommon vaccine name: ${vaccinationData.vaccineName}`);
    }

    if (!vaccinationData.dateAdministered) {
      throw new ValidationError("Date administered is required", undefined, context);
    }

    if (!(vaccinationData.dateAdministered instanceof Date)) {
      throw new ValidationError("Date administered must be a valid date", undefined, context);
    }

    if (vaccinationData.dateAdministered > new Date()) {
      throw new ValidationError("Date administered cannot be in the future", undefined, context);
    }

    if (!vaccinationData.nextDueDate) {
      throw new ValidationError("Next due date is required", undefined, context);
    }

    if (!(vaccinationData.nextDueDate instanceof Date)) {
      throw new ValidationError("Next due date must be a valid date", undefined, context);
    }

    if (vaccinationData.nextDueDate <= vaccinationData.dateAdministered) {
      throw new ValidationError("Next due date must be after date administered", undefined, context);
    }

    const maxDueDate = new Date();
    maxDueDate.setFullYear(maxDueDate.getFullYear() + 5);
    if (vaccinationData.nextDueDate > maxDueDate) {
      throw new ValidationError("Next due date cannot be more than 5 years in the future", undefined, context);
    }

    if (!vaccinationData.administeredBy || vaccinationData.administeredBy.trim() === '') {
      throw new ValidationError("Administered by is required", undefined, context);
    }

    if (vaccinationData.lotNumber && vaccinationData.lotNumber.length > 50) {
      throw new ValidationError("Lot number cannot exceed 50 characters", undefined, context);
    }

    if (vaccinationData.manufacturer && vaccinationData.manufacturer.length > 100) {
      throw new ValidationError("Manufacturer cannot exceed 100 characters", undefined, context);
    }

    if (vaccinationData.notes && vaccinationData.notes.length > 1000) {
      throw new ValidationError("Notes cannot exceed 1000 characters", undefined, context);
    }
  }
}
