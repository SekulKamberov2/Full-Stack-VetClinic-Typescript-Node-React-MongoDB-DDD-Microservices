import { Patient } from '../../domain/entities/Patient';
import { PatientRepository } from '../../domain/repositories/PatientRepository';

export class UpdatePatientUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(id: string, patientData: Partial<{
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

    const updatedPatient = existingPatient.update({
      name: patientData.name ?? existingPatient.name,
      species: patientData.species ?? existingPatient.species,
      breed: patientData.breed ?? existingPatient.breed,
      dateOfBirth: patientData.dateOfBirth ?? existingPatient.dateOfBirth,
      medicalAlerts: patientData.medicalAlerts ?? existingPatient.medicalAlerts,
      isActive: patientData.isActive ?? existingPatient.isActive,
    });

    await this.patientRepository.update(updatedPatient);
    return updatedPatient;
  }
}
