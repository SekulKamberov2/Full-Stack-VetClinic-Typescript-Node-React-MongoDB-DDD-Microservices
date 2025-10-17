import { MedicalAlert, AlertSeverity } from '../../../domain/entities/MedicalAlert';
import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { ValidationError, NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class UpdateMedicalAlertUseCase {
  constructor(private medicalAlertRepository: MedicalAlertRepository) {}

  async execute(id: string, alertData: Partial<{
    alertText: string;
    severity: AlertSeverity;
    isActive: boolean;
    notes?: string;
  }>): Promise<MedicalAlert> {
    try {
      this.validateMedicalAlertData(alertData);
      
      const existingAlert = await this.medicalAlertRepository.findById(id);
      if (!existingAlert) {
        throw new NotFoundError(
          `Medical alert with ID ${id} not found`,
          undefined,
          'UpdateMedicalAlertUseCase'
        );
      }

      const updatedAlert = existingAlert.update(alertData);
      await this.medicalAlertRepository.update(updatedAlert);
      return updatedAlert;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Update medical alert') as never;
    }
  } 

  private validateMedicalAlertData(alertData: any): void {
    const context = 'UpdateMedicalAlertUseCase';

    if (alertData.alertText !== undefined) {
      if (!alertData.alertText || alertData.alertText.trim() === '') {
        throw new ValidationError("Alert text cannot be empty", undefined, context);
      }

      if (alertData.alertText.length > 1000) {
        throw new ValidationError("Alert text cannot exceed 1000 characters", undefined, context);
      }
    }

    if (alertData.severity !== undefined) {
      const validSeverities = Object.values(AlertSeverity);
      if (!validSeverities.includes(alertData.severity as AlertSeverity)) {
        throw new ValidationError(
          `Invalid severity. Must be one of: ${validSeverities.join(', ')}`,
          undefined,
          context
        );
      }
    }

    if (alertData.notes !== undefined && alertData.notes.length > 2000) {
      throw new ValidationError("Notes cannot exceed 2000 characters", undefined, context);
    }
  }
}
