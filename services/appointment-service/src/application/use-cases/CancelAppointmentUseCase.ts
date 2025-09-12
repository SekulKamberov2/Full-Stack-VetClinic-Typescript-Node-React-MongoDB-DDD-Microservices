import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
import { AppointmentCancelledEvent } from '../../domain/events/AppointmentEvents';
import { NotFoundError, ErrorHandler } from '@vetclinic/shared-kernel';

export class CancelAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(appointmentId: string, cancelledBy: string, reason?: string): Promise<void> {
    try {
      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        throw new NotFoundError(
          `Appointment with ID ${appointmentId} not found`,
          undefined,
          'CancelAppointmentUseCase'
        );
      }
      
      const cancelledAppointment = appointment.cancel(cancelledBy, reason);
      await this.appointmentRepository.save(cancelledAppointment);
      
      this.eventPublisher.publish(new AppointmentCancelledEvent(
        appointmentId, 
        { cancelledBy, reason }
      ));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'CancelAppointmentUseCase');
    }
  }
}
