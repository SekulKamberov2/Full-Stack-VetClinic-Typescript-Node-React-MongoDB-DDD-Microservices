import { PatientRepository } from '../../domain/repositories/PatientRepository';

export class DeletePatientUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(id: string): Promise<void> {
    const existingPatient = await this.patientRepository.findById(id);
    if (!existingPatient) {
      throw new Error('Patient not found');
    }

    await this.patientRepository.delete(id);
  }
}