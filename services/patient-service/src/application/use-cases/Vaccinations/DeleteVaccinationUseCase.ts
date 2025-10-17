import { VaccinationRecordRepository } from '../../../domain/repositories/VaccinationRecordRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class DeleteVaccinationUseCase {
  constructor(private vaccinationRepository: VaccinationRecordRepository) {}

  async execute(id: string): Promise<void> {
    try {
      const existingVaccination = await this.vaccinationRepository.findById(id);
      if (!existingVaccination) {
        throw new NotFoundError(
          `Vaccination record with ID ${id} not found`,
          undefined,
          'DeleteVaccinationUseCase'
        );
      }

      await this.vaccinationRepository.delete(id);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Delete vaccination record') as never;
    }
  }
}
