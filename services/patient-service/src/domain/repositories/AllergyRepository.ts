import { Allergy } from '../entities/Allergy';

export interface AllergyRepository {
  findById(id: string): Promise<Allergy | null>;
  findByPatientId(patientId: string): Promise<Allergy[]>;
  findAll(): Promise<Allergy[]>;
  findActiveByPatientId(patientId: string): Promise<Allergy[]>;
  save(allergy: Allergy): Promise<Allergy>;
  update(allergy: Allergy): Promise<void>;
  delete(id: string): Promise<void>;
}
