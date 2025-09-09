import { Patient } from '../entities/Patient';

export interface PatientRepository {
  findById(id: string): Promise<Patient | null>;
  findByOwnerId(ownerId: string): Promise<Patient[]>;
  findAll(): Promise<Patient[]>;
  save(patient: Patient): Promise<Patient>; 
  update(patient: Patient): Promise<void>;
  delete(id: string): Promise<void>;
}