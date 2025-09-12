import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
export declare class CreateAppointmentUseCase {
    private appointmentRepository;
    private eventPublisher;
    constructor(appointmentRepository: AppointmentRepository, eventPublisher: EventPublisher);
    execute(appointmentData: {
        clientId: string;
        patientId: string;
        veterinarianId: string;
        appointmentDate: Date;
        duration: number;
        reason: string;
        notes?: string;
    }): Promise<Appointment>;
    private validateAppointmentData;
    private checkVeterinarianAvailability;
}
//# sourceMappingURL=CreateAppointmentUseCase.d.ts.map