import { VaccinationRecord } from '../../../domain/entities/VaccinationRecord';
import { VaccinationRecordRepository } from '../../../domain/repositories/VaccinationRecordRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetAllVaccinationsUseCase {
  constructor(private vaccinationRepository: VaccinationRecordRepository) {}

  async execute(): Promise<VaccinationRecord[]> {
    try {
      return await this.vaccinationRepository.findAll();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get all vaccinations') as never;
    }
  }
}
