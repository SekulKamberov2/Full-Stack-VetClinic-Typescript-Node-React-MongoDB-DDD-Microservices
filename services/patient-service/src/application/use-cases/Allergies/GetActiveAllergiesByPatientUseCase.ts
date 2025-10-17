import { Allergy } from '../../../domain/entities/Allergy';
import { AllergyRepository } from '../../../domain/repositories/AllergyRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetActiveAllergiesByPatientUseCase {
  constructor(private allergyRepository: AllergyRepository) {}

  async execute(patientId: string): Promise<Allergy[]> {
    try {
      this.validatePatientId(patientId);

      return await this.allergyRepository.findActiveByPatientId(patientId);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get active allergies by patient') as never;
    }
  }

  private validatePatientId(patientId: string): void {
    const context = 'GetActiveAllergiesByPatientUseCase';

    if (!patientId || patientId.trim() === '') {
      throw new ValidationError("Patient ID is required", undefined, context);
    }

    const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
    if (!mongoIdRegex.test(patientId)) {
      throw new ValidationError("Invalid patient ID format", undefined, context);
    }
  }
}
