import { MedicalAlert } from '../../../domain/entities/MedicalAlert';
import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetActiveMedicalAlertsByPatientUseCase {
  constructor(private medicalAlertRepository: MedicalAlertRepository) {}

  async execute(patientId: string): Promise<MedicalAlert[]> {
    try {
      if (!patientId || patientId.trim() === '') {
        throw new ValidationError("Patient ID is required", undefined, 'GetActiveMedicalAlertsByPatientUseCase');
      }

      return await this.medicalAlertRepository.findActiveByPatientId(patientId);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get active medical alerts by patient') as never;
    }
  }
}
