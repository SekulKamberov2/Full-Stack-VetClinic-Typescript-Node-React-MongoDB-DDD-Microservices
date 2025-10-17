import { VaccinationRecord } from '../../../domain/entities/VaccinationRecord';
import { VaccinationRecordRepository } from '../../../domain/repositories/VaccinationRecordRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetOverdueVaccinationsUseCase {
  constructor(private vaccinationRepository: VaccinationRecordRepository) {}

  async execute(): Promise<VaccinationRecord[]> {
    try {
      return await this.vaccinationRepository.findOverdueVaccinations();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get overdue vaccinations') as never;
    }
  }
}
