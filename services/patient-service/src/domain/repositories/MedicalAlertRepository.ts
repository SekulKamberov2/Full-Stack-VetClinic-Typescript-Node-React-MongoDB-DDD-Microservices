import { MedicalAlert } from '../entities/MedicalAlert';

export interface MedicalAlertRepository {
  findById(id: string): Promise<MedicalAlert | null>;
  findByPatientId(patientId: string): Promise<MedicalAlert[]>;
  findActiveByPatientId(patientId: string): Promise<MedicalAlert[]>;
  findBySeverity(severity: string): Promise<MedicalAlert[]>;
  findAll(): Promise<MedicalAlert[]>; 
  findCriticalAlerts(): Promise<MedicalAlert[]>;
  save(alert: MedicalAlert): Promise<MedicalAlert>;
  findCriticalAlerts(): Promise<MedicalAlert[]>;
  update(alert: MedicalAlert): Promise<void>;
  delete(id: string): Promise<void>;
}
