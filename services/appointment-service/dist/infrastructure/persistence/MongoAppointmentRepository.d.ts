import { Appointment, AppointmentStatus } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
export declare class MongoAppointmentRepository implements AppointmentRepository {
    private model;
    constructor();
    findById(id: string): Promise<Appointment | null>;
    findByClientId(clientId: string): Promise<Appointment[]>;
    findByVeterinarianId(veterinarianId: string): Promise<Appointment[]>;
    findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]>;
    findByVeterinarianIdAndDateRange(veterinarianId: string, startDate: Date, endDate: Date): Promise<Appointment[]>;
    findConflictingAppointments(veterinarianId: string, appointmentDate: Date, duration: number): Promise<Appointment[]>;
    save(appointment: Appointment): Promise<Appointment>;
    update(appointment: Appointment): Promise<void>;
    delete(id: string): Promise<void>;
    exists(id: string): Promise<boolean>;
    private toEntity;
    private toDocument;
    private handleDatabaseError;
    private isDuplicateKeyError;
    countByStatus(status: AppointmentStatus): Promise<number>;
    findByStatus(status: AppointmentStatus): Promise<Appointment[]>;
    getUpcomingAppointments(days?: number): Promise<Appointment[]>;
}
//# sourceMappingURL=MongoAppointmentRepository.d.ts.map