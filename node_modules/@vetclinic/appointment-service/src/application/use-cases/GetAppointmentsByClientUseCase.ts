import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';

export class GetAppointmentsByClientUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(clientId: string): Promise<Appointment[]> {
    return this.appointmentRepository.findByClientId(clientId);
  }
}