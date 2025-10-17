import { MedicalAlert } from '../../../domain/entities/MedicalAlert';
import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class DeactivateMedicalAlertUseCase {
  constructor(private medicalAlertRepository: MedicalAlertRepository) {}

  async execute(id: string): Promise<MedicalAlert> {
    try {
      const existingAlert = await this.medicalAlertRepository.findById(id);
      if (!existingAlert) {
        throw new NotFoundError(
          `Medical alert with ID ${id} not found`,
          undefined,
          'DeactivateMedicalAlertUseCase'
        );
      }

      if (!existingAlert.isActive) {
        return existingAlert;
      }

      const deactivatedAlert = existingAlert.deactivate();
      await this.medicalAlertRepository.update(deactivatedAlert);
      return deactivatedAlert;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Deactivate medical alert') as never;
    }
  }
}
