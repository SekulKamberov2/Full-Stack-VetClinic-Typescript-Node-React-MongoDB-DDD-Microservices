import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
export declare class CancelAppointmentUseCase {
    private appointmentRepository;
    private eventPublisher;
    constructor(appointmentRepository: AppointmentRepository, eventPublisher: EventPublisher);
    execute(appointmentId: string, cancelledBy: string, reason?: string): Promise<void>;
}
//# sourceMappingURL=CancelAppointmentUseCase.d.ts.map