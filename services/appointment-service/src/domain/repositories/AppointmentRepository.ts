import { Appointment } from '../entities/Appointment';

export interface AppointmentRepository {
  findById(id: string): Promise<Appointment | null>;
  findByClientId(clientId: string): Promise<Appointment[]>;
  findByVeterinarianId(veterinarianId: string): Promise<Appointment[]>;
  findByVeterinarianIdAndDateRange(veterinarianId: string, startDate: Date, endDate: Date): Promise<Appointment[]>;
  findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]>;
  save(appointment: Appointment): Promise<Appointment>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
}