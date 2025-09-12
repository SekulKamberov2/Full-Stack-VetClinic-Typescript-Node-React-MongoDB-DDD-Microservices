import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { ValidationError, ErrorHandler } from '@vetclinic/shared-kernel';

export class GetAppointmentsByVetUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(veterinarianId: string): Promise<Appointment[]> {
    try {
      if (!veterinarianId || veterinarianId.trim() === '') {
        throw new ValidationError(
          'Veterinarian ID is required',
          undefined,
          'GetAppointmentsByVetUseCase'
        );
      }

      return await this.appointmentRepository.findByVeterinarianId(veterinarianId);
    } catch (error) {
      ErrorHandler.handleAppError(error, 'GetAppointmentsByVetUseCase');
    }
  }
}
