import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';

export class GetAppointmentsByVetUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(veterinarianId: string): Promise<Appointment[]> {
    return this.appointmentRepository.findByVeterinarianId(veterinarianId);
  }
}