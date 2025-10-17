import { VaccinationRecord } from '../../../domain/entities/VaccinationRecord';
import { VaccinationRecordRepository } from '../../../domain/repositories/VaccinationRecordRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetVaccinationUseCase {
  constructor(private vaccinationRepository: VaccinationRecordRepository) {}

  async execute(id: string): Promise<VaccinationRecord | null> {
    try {
      return await this.vaccinationRepository.findById(id);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get vaccination record') as never;
    }
  }
}
