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
  }>): Promise<Patient> {
    const existingPatient = await this.patientRepository.findById(id);
    if (!existingPatient) {
      throw new Error('Patient not found');
    }

    const updatedPatient = existingPatient.updateMedicalAlerts(
      patientData.medicalAlerts || existingPatient.medicalAlerts
    );
    await this.patientRepository.update(updatedPatient);
    return updatedPatient;
  }
}