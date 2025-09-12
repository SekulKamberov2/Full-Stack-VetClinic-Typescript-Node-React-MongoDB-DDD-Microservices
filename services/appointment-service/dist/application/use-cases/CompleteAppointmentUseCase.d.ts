import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
export declare class CompleteAppointmentUseCase {
    private appointmentRepository;
    private eventPublisher;
    constructor(appointmentRepository: AppointmentRepository, eventPublisher: EventPublisher);
    execute(appointmentId: string, completedBy: string, notes?: string): Promise<void>;
}
//# sourceMappingURL=CompleteAppointmentUseCase.d.ts.map