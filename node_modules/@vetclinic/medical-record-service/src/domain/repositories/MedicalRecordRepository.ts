import { MedicalRecord } from "../entities/MedicalRecord";

export interface MedicalRecordRepository {
  findById(id: string): Promise<MedicalRecord | null>;
  findByPatientId(patientId: string): Promise<MedicalRecord[]>;
  findByClientId(clientId: string): Promise<MedicalRecord[]>;
  findByVeterinarianId(veterinarianId: string): Promise<MedicalRecord[]>;
  findByAppointmentId(appointmentId: string): Promise<MedicalRecord | null>;

  findAll(
    filter?: any,
    options?: { sort?: any; limit?: number; skip?: number }
  ): Promise<MedicalRecord[]>;

  exists(id: string): Promise<boolean>;

  findAllWithPagination(
    skip?: number,
    limit?: number,
    filters?: {
      patientId?: string;
      clientId?: string;
      veterinarianId?: string;
      dateFrom?: Date;
      dateTo?: Date;
    }
  ): Promise<{ records: MedicalRecord[]; totalCount: number }>;

  delete(id: string): Promise<boolean>;  
  save(record: MedicalRecord): Promise<MedicalRecord>;
  cleanupCorruptedData(): Promise<void>;
}
