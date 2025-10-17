import { Patient } from '../../../domain/entities/Patient';
import { PatientRepository } from '../../../domain/repositories/PatientRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetPatientsByOwnerUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(ownerId: string): Promise<Patient[]> {
    try {
      if (!ownerId || ownerId.trim() === '') {
        throw new ValidationError("Owner ID is required", undefined, 'GetPatientsByOwnerUseCase');
      }

      return await this.patientRepository.findByOwnerId(ownerId);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get patients by owner') as never;
    }
  }
}
