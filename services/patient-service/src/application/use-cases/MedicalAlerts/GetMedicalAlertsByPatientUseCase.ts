import { MedicalAlert } from '../../../domain/entities/MedicalAlert';
import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetMedicalAlertsByPatientUseCase {
  constructor(private medicalAlertRepository: MedicalAlertRepository) {}

  async execute(patientId: string): Promise<MedicalAlert[]> {
    try {
      if (!patientId || patientId.trim() === '') {
        throw new ValidationError("Patient ID is required", undefined, 'GetMedicalAlertsByPatientUseCase');
      }

      return await this.medicalAlertRepository.findByPatientId(patientId);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get medical alerts by patient') as never;
    }
  }
}
