import { Patient } from '../../../domain/entities/Patient';
import { PatientRepository } from '../../../domain/repositories/PatientRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetAllPatientsUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(): Promise<Patient[]> {
    try {
      return await this.patientRepository.findAll();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get all patients') as never;
    }
  }
}
