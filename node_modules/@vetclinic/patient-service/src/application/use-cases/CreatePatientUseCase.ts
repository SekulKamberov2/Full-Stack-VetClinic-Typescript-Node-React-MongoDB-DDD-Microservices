import { Patient } from '../../domain/entities/Patient';
import { PatientRepository } from '../../domain/repositories/PatientRepository';

export class CreatePatientUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(patientData: {
    name: string;
    species: string;
    breed: string;
    dateOfBirth: Date;
    medicalAlerts: string[];
    ownerId: string;
  }): Promise<Patient> { 
    const patient = Patient.create(patientData); 
    const savedPatient = await this.patientRepository.save(patient);
     
    return savedPatient;   
  }
}