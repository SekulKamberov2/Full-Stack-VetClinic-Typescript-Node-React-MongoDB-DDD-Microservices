import { MedicalAlert } from '../../../domain/entities/MedicalAlert';
import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetCriticalAlertsUseCase {
  constructor(private medicalAlertRepository: MedicalAlertRepository) {}

  async execute(): Promise<MedicalAlert[]> {
    try {
      return await this.medicalAlertRepository.findCriticalAlerts();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get critical alerts') as never;
    }
  }
}
