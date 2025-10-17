import { MedicalAlert } from '../../../domain/entities/MedicalAlert';
import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetAllMedicalAlertsUseCase {
  constructor(private medicalAlertRepository: MedicalAlertRepository) {}

  async execute(): Promise<MedicalAlert[]> {
    try {
      return await this.medicalAlertRepository.findAll();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get all medical alerts') as never;
    }
  }
}
