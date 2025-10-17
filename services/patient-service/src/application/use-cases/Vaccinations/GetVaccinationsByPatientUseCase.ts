import { VaccinationRecord } from '../../../domain/entities/VaccinationRecord';
import { VaccinationRecordRepository } from '../../../domain/repositories/VaccinationRecordRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetVaccinationsByPatientUseCase {
  constructor(private vaccinationRepository: VaccinationRecordRepository) {}

  async execute(patientId: string): Promise<VaccinationRecord[]> {
    try {
      if (!patientId || patientId.trim() === '') {
        throw new ValidationError("Patient ID is required", undefined, 'GetVaccinationsByPatientUseCase');
      }

      return await this.vaccinationRepository.findByPatientId(patientId);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get vaccinations by patient') as never;
    }
  }
}
