import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
export declare class StartAppointmentUseCase {
    private appointmentRepository;
    private eventPublisher;
    constructor(appointmentRepository: AppointmentRepository, eventPublisher: EventPublisher);
    execute(appointmentId: string, startedBy: string): Promise<void>;
}
//# sourceMappingURL=StartAppointmentUseCase.d.ts.map