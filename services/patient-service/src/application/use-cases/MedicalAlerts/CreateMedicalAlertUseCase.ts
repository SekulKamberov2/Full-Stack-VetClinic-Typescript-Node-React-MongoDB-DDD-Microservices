import { MedicalAlert, MedicalAlertProps, AlertSeverity } from '../../../domain/entities/MedicalAlert';
import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class CreateMedicalAlertUseCase {
  constructor(private medicalAlertRepository: MedicalAlertRepository) {}

  async execute(medicalAlertData: Omit<MedicalAlertProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<MedicalAlert> {
    try {
      this.validateMedicalAlertData(medicalAlertData);

      const medicalAlert = MedicalAlert.create({
        ...medicalAlertData,
        dateCreated: medicalAlertData.dateCreated || new Date(),
        isActive: medicalAlertData.isActive ?? true
      });

      return await this.medicalAlertRepository.save(medicalAlert);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Create medical alert') as never;
    }
  }

  private validateMedicalAlertData(medicalAlertData: any): void {
    const context = 'CreateMedicalAlertUseCase';

    if (!medicalAlertData.patientId || medicalAlertData.patientId.trim() === '') {
      throw new ValidationError("Patient ID is required", undefined, context);
    }

    if (!medicalAlertData.alertText || medicalAlertData.alertText.trim() === '') {
      throw new ValidationError("Alert text is required", undefined, context);
    }

    if (!medicalAlertData.severity) {
      throw new ValidationError("Severity is required", undefined, context);
    }

    const validSeverities = Object.values(AlertSeverity);
    if (!validSeverities.includes(medicalAlertData.severity)) {
      throw new ValidationError(
        `Invalid severity. Must be one of: ${validSeverities.join(', ')}`,
        undefined,
        context
      );
    }

    if (!medicalAlertData.createdBy || medicalAlertData.createdBy.trim() === '') {
      throw new ValidationError("Created by is required", undefined, context);
    }

    if (!medicalAlertData.dateCreated) {
      throw new ValidationError("Date created is required", undefined, context);
    }

    if (medicalAlertData.dateCreated > new Date()) {
      throw new ValidationError("Date created cannot be in the future", undefined, context);
    }

    if (medicalAlertData.alertText.length > 1000) {
      throw new ValidationError("Alert text cannot exceed 1000 characters", undefined, context);
    }

    if (medicalAlertData.notes && medicalAlertData.notes.length > 2000) {
      throw new ValidationError("Notes cannot exceed 2000 characters", undefined, context);
    }
  }
}
