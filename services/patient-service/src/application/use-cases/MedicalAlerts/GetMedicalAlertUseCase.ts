import { MedicalAlert } from '../../../domain/entities/MedicalAlert';
import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetMedicalAlertUseCase {
  constructor(private medicalAlertRepository: MedicalAlertRepository) {}

  async execute(id: string): Promise<MedicalAlert | null> {
    try {
      return await this.medicalAlertRepository.findById(id);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get medical alert') as never;
    }
  }
}
