import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
import { AppointmentConfirmedEvent } from '../../domain/events/AppointmentEvents';
import { NotFoundError, ErrorHandler } from '@vetclinic/shared-kernel';

export class ConfirmAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(appointmentId: string, confirmedBy: string): Promise<void> {
    try {
      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        throw new NotFoundError(
          `Appointment with ID ${appointmentId} not found`,
          undefined,
          'ConfirmAppointmentUseCase'
        );
      }
      
      const confirmedAppointment = appointment.confirm(confirmedBy);
      await this.appointmentRepository.save(confirmedAppointment);
      
      this.eventPublisher.publish(new AppointmentConfirmedEvent(
        appointmentId, 
        { confirmedBy }
      ));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'ConfirmAppointmentUseCase');
    }
  }
}
