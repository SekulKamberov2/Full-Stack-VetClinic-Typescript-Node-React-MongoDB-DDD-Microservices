import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
export declare class GetAppointmentsByVetUseCase {
    private appointmentRepository;
    constructor(appointmentRepository: AppointmentRepository);
    execute(veterinarianId: string): Promise<Appointment[]>;
}
//# sourceMappingURL=GetAppointmentsByVetUseCase.d.ts.map