import { Patient } from '../../domain/entities/Patient';
import { PatientRepository } from '../../domain/repositories/PatientRepository';

export class GetAllPatientsUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(): Promise<Patient[]> {
    return this.patientRepository.findAll();
  }
}