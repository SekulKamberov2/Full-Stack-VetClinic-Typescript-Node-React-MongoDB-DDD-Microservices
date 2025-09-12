import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
export declare class ConfirmAppointmentUseCase {
    private appointmentRepository;
    private eventPublisher;
    constructor(appointmentRepository: AppointmentRepository, eventPublisher: EventPublisher);
    execute(appointmentId: string, confirmedBy: string): Promise<void>;
}
//# sourceMappingURL=ConfirmAppointmentUseCase.d.ts.map