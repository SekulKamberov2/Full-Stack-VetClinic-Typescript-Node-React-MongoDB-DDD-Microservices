import { Patient } from '../../../domain/entities/Patient';
import { PatientRepository } from '../../../domain/repositories/PatientRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetPatientUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(id: string): Promise<Patient | null> {
    try {
      const patient = await this.patientRepository.findById(id);
      return patient;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get patient') as never;
    }
  }
}
