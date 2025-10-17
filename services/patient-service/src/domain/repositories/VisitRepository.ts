import { Visit } from '../entities/Visit';

export interface VisitRepository {
  findById(id: string): Promise<Visit | null>;
  findByPatientId(patientId: string): Promise<Visit[]>;
  findByVeterinarianId(veterinarianId: string): Promise<Visit[]>;
  findByStatus(status: string): Promise<Visit[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Visit[]>;
  findAll(): Promise<Visit[]>;
  findUpcomingVisits(days?: number): Promise<Visit[]>;
  findOverdueVisits(): Promise<Visit[]>;
  getVisitStats(): Promise<any>;
  save(visit: Visit): Promise<Visit>;
  update(visit: Visit): Promise<void>;
  delete(id: string): Promise<void>;
}
