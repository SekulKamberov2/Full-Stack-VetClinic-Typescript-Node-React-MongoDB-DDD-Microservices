import { Appointment } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { ValidationError, ErrorHandler } from '@vetclinic/shared-kernel';

export class GetAppointmentsByClientUseCase {
  constructor(private appointmentRepository: AppointmentRepository) {}

  async execute(clientId: string): Promise<Appointment[]> {
    try {
      if (!clientId || clientId.trim() === '') {
        throw new ValidationError(
          'Client ID is required',
          undefined,
          'GetAppointmentsByClientUseCase'
        );
      }

      return await this.appointmentRepository.findByClientId(clientId);
    } catch (error) {
      ErrorHandler.handleAppError(error, 'GetAppointmentsByClientUseCase');
    }
  }
}
