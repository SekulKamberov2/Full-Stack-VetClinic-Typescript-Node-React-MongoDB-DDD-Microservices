import { Patient } from '../../domain/entities/Patient';
import { PatientRepository } from '../../domain/repositories/PatientRepository';

export class PartialUpdatePatientUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(id: string, partialData: Partial<{
    name: string;
    species: string;
    breed: string;
    dateOfBirth: Date;
    medicalAlerts: string[];
    isActive: boolean;
  }>): Promise<Patient> {
    const existingPatient = await this.patientRepository.findById(id);
    if (!existingPatient) {
      throw new Error('Patient not found');
    }

    const updatedPatient = existingPatient.partialUpdate(partialData);
    await this.patientRepository.update(updatedPatient);
    return updatedPatient;
  }
}
