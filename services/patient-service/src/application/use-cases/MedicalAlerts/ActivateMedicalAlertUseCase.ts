import { MedicalAlert } from '../../../domain/entities/MedicalAlert';
import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class ActivateMedicalAlertUseCase {
  constructor(private medicalAlertRepository: MedicalAlertRepository) {}

  async execute(id: string): Promise<MedicalAlert> {
    try {
      const existingAlert = await this.medicalAlertRepository.findById(id);
      if (!existingAlert) {
        throw new NotFoundError(
          `Medical alert with ID ${id} not found`,
          undefined,
          'ActivateMedicalAlertUseCase'
        );
      }

      if (existingAlert.isActive) {
        return existingAlert;
      }

      const activatedAlert = existingAlert.activate();
      await this.medicalAlertRepository.update(activatedAlert);
      return activatedAlert;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Activate medical alert') as never;
    }
  }
}
