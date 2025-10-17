import { PatientStats } from 'src/application/use-cases/Patients/GetPatientStatsUseCase';
import { Patient } from '../entities/Patient';

export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  findByOwnerId(ownerId: string): Promise<Patient[]>;
  findBySpecies(species: string): Promise<Patient[]>;
  findByStatus(status: string): Promise<Patient[]>;
  findAll(): Promise<Patient[]>;
  save(patient: Patient): Promise<Patient>;
  update(patient: Patient): Promise<void>;
  delete(id: string): Promise<void>;
  search(query: string, ownerId?: string): Promise<Patient[]>;
  existsByNameAndOwner(name: string, ownerId: string): Promise<boolean>;
  findByMicrochip(microchipNumber: string): Promise<Patient | null>; 
  getPatientStats(ownerId?: string): Promise<PatientStats>; 
  findAllIncludingInactive(): Promise<Patient[]>;
}
