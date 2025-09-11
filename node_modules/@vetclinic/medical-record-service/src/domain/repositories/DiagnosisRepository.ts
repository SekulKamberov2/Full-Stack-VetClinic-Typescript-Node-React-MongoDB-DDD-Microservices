import { Diagnosis } from "../entities/Diagnosis";

export interface DiagnosisRepository {
  findById(id: string): Promise<Diagnosis | null>;
  findByRecordId(recordId: string): Promise<Diagnosis[]>;
  findByDescription(description: string): Promise<Diagnosis[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Diagnosis[]>;
  findRecent(days?: number): Promise<Diagnosis[]>;
  findWithNotes(): Promise<Diagnosis[]>;
  findAll(): Promise<Diagnosis[]>;
  search(query: string): Promise<Diagnosis[]>;
  
  getStats(): Promise<{
    totalDiagnoses: number;
    diagnosesWithNotes: number;
    diagnosesByRecord: Record<string, number>;
    mostCommonDiagnoses: { diagnosis: string; count: number }[];
  }>;

  getDiagnosisStats(): Promise<{
    total: number;
    withNotes: number;
    byRecord: Record<string, number>;
    topDiagnoses: { diagnosis: string; count: number }[];
    monthlyTrend: { month: string; count: number }[];
  }>;

  save(diagnosis: Diagnosis): Promise<Diagnosis>;
  update(diagnosis: Diagnosis): Promise<boolean>;
  updateById(id: string, updateData: Partial<Diagnosis>): Promise<boolean>;
  delete(id: string): Promise<boolean>;
  exists(id: string): Promise<boolean>;
  updateNotes(ids: string[], notes: string): Promise<void>;
  getDiagnosisTrend(startDate: Date, endDate: Date): Promise<{ date: string; count: number }[]>;
}
