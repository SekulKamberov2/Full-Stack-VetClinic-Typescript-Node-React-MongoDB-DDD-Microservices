import { MedicalAlert, AlertSeverity } from '../../../domain/entities/MedicalAlert';
import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetMedicalAlertsBySeverityUseCase {
  constructor(private medicalAlertRepository: MedicalAlertRepository) {}

  async execute(severity: string): Promise<MedicalAlert[]> {
    try {
      if (!severity || severity.trim() === '') {
        throw new ValidationError("Severity is required", undefined, 'GetMedicalAlertsBySeverityUseCase');
      }

      const validSeverities = Object.values(AlertSeverity);
      if (!validSeverities.includes(severity as AlertSeverity)) {
        throw new ValidationError(
          `Invalid severity. Must be one of: ${validSeverities.join(', ')}`,
          undefined,
          'GetMedicalAlertsBySeverityUseCase'
        );
      }

      return await this.medicalAlertRepository.findBySeverity(severity);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get medical alerts by severity') as never;
    }
  }
}
