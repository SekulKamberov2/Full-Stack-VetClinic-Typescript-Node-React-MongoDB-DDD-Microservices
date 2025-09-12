import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
import { AppointmentCompletedEvent } from '../../domain/events/AppointmentEvents';
import { NotFoundError, ErrorHandler } from '@vetclinic/shared-kernel';

export class CompleteAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(appointmentId: string, completedBy: string, notes?: string): Promise<void> {
    try {
      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        throw new NotFoundError(
          `Appointment with ID ${appointmentId} not found`,
          undefined,
          'CompleteAppointmentUseCase'
        );
      }
      
      const completedAppointment = appointment.complete(completedBy, notes);
      await this.appointmentRepository.save(completedAppointment);
      
      this.eventPublisher.publish(new AppointmentCompletedEvent(
        appointmentId, 
        { completedBy, notes }
      ));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'CompleteAppointmentUseCase');
    }
  }
}
