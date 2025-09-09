import { MedicalRecord } from "../entities/MedicalRecord"; 

export interface MedicalRecordRepository {
  save(record: MedicalRecord): Promise<MedicalRecord>;  
  findById(id: string): Promise<MedicalRecord | null>;
  findByPatientId(patientId: string): Promise<MedicalRecord[]>;
  findByClientId(clientId: string): Promise<MedicalRecord[]>;
  findByVeterinarianId(veterinarianId: string): Promise<MedicalRecord[]>;
  findByAppointmentId(appointmentId: string): Promise<MedicalRecord | null>;
  findAll(skip?: number, limit?: number, filters?: any): Promise<{ records: MedicalRecord[]; totalCount: number }>;
  exists(id: string): Promise<boolean>;
  delete(id: string): Promise<boolean>;
}
