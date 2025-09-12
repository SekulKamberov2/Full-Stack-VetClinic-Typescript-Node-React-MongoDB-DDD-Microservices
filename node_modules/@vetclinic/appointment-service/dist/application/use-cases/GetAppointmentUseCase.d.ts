import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
export declare class GetAppointmentUseCase {
    private appointmentRepository;
    constructor(appointmentRepository: AppointmentRepository);
    execute(id: string): Promise<Appointment | null>;
}
//# sourceMappingURL=GetAppointmentUseCase.d.ts.map