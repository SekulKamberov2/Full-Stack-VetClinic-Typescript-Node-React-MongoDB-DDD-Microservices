import { VaccinationStats } from 'src/application/use-cases/Vaccinations/GetVaccinationStatsUseCase';
import { VaccinationRecord } from '../entities/VaccinationRecord';

export interface VaccinationRecordRepository {
  findById(id: string): Promise<VaccinationRecord | null>;
  findByPatientId(patientId: string): Promise<VaccinationRecord[]>;
  findAll(): Promise<VaccinationRecord[]>;
  findDueVaccinations(): Promise<VaccinationRecord[]>;
  findOverdueVaccinations(): Promise<VaccinationRecord[]>;
  getVaccinationStats(): Promise<VaccinationStats>;
  save(vaccination: VaccinationRecord): Promise<VaccinationRecord>;
  update(vaccination: VaccinationRecord): Promise<void>;
  delete(id: string): Promise<void>;
}
