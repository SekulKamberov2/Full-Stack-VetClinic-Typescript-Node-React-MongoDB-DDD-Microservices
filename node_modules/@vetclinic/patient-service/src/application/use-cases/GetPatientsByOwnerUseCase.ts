import { Patient } from '../../domain/entities/Patient';
import { PatientRepository } from '../../domain/repositories/PatientRepository';

export class GetPatientsByOwnerUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(ownerId: string): Promise<Patient[]> {
    return this.patientRepository.findByOwnerId(ownerId);
  }
}