import { MedicalAlert, AlertSeverity } from '../../../domain/entities/MedicalAlert';
import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { ValidationError, NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class UpdateMedicalAlertSeverityUseCase {
  constructor(private medicalAlertRepository: MedicalAlertRepository) {}

  async execute(id: string, severity: string): Promise<MedicalAlert> {
    try {
      const validSeverities = Object.values(AlertSeverity);
      if (!validSeverities.includes(severity as AlertSeverity)) {
        throw new ValidationError(
          `Invalid severity. Must be one of: ${validSeverities.join(', ')}`,
          undefined,
          'UpdateMedicalAlertSeverityUseCase'
        );
      }

      const existingAlert = await this.medicalAlertRepository.findById(id);
      if (!existingAlert) {
        throw new NotFoundError(
          `Medical alert with ID ${id} not found`,
          undefined,
          'UpdateMedicalAlertSeverityUseCase'
        );
      }

      const updatedAlert = existingAlert.updateSeverity(severity as AlertSeverity);
      await this.medicalAlertRepository.update(updatedAlert);
      return updatedAlert;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Update medical alert severity') as never;
    }
  }
}
