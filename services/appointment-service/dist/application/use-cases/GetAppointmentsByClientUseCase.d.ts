import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
export declare class GetAppointmentsByClientUseCase {
    private appointmentRepository;
    constructor(appointmentRepository: AppointmentRepository);
    execute(clientId: string): Promise<Appointment[]>;
}
//# sourceMappingURL=GetAppointmentsByClientUseCase.d.ts.map