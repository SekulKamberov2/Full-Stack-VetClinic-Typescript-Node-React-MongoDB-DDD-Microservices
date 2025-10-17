import { VaccinationRecord } from '../../../domain/entities/VaccinationRecord';
import { VaccinationRecordRepository } from '../../../domain/repositories/VaccinationRecordRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetDueVaccinationsUseCase {
  constructor(private vaccinationRepository: VaccinationRecordRepository) {}

  async execute(): Promise<VaccinationRecord[]> {
    try {
      return await this.vaccinationRepository.findDueVaccinations();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get due vaccinations') as never;
    }
  }
}
