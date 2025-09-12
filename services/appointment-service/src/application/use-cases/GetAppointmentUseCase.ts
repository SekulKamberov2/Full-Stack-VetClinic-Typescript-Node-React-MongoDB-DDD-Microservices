import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { ValidationError, NotFoundError, ErrorHandler } from '@vetclinic/shared-kernel';

export class GetAppointmentUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(id: string): Promise<Appointment> {
    try {
      if (!id || id.trim() === '') {
        throw new ValidationError(
          'Appointment ID is required',
          undefined,
          'GetAppointmentUseCase'
        );
      }

      const appointment = await this.appointmentRepository.findById(id);
      if (!appointment) {
        throw new NotFoundError(
          `Appointment with ID ${id} not found`,
          undefined,
          'GetAppointmentUseCase'
        );
      }

      return appointment;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'GetAppointmentUseCase');
    }
  }
}
