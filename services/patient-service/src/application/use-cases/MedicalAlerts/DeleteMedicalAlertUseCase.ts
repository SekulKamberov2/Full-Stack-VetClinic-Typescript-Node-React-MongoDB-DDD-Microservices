import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class DeleteMedicalAlertUseCase {
  constructor(private medicalAlertRepository: MedicalAlertRepository) {}

  async execute(id: string): Promise<void> {
    try {
      const existingAlert = await this.medicalAlertRepository.findById(id);
      if (!existingAlert) {
        throw new NotFoundError(
          `Medical alert with ID ${id} not found`,
          undefined,
          'DeleteMedicalAlertUseCase'
        );
      }

      await this.medicalAlertRepository.delete(id);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Delete medical alert') as never;
    }
  }
}
