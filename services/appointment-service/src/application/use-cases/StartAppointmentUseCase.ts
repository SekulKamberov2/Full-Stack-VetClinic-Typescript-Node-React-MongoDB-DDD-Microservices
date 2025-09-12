import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
import { AppointmentStartedEvent } from '../../domain/events/AppointmentEvents';
import { NotFoundError, ErrorHandler } from '@vetclinic/shared-kernel';

export class StartAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(appointmentId: string, startedBy: string): Promise<void> {
    try {
      const appointment = await this.appointmentRepository.findById(appointmentId);
      if (!appointment) {
        throw new NotFoundError(
          `Appointment with ID ${appointmentId} not found`,
          undefined,
          'StartAppointmentUseCase'
        );
      }
      
      const startedAppointment = appointment.start(startedBy);
      await this.appointmentRepository.save(startedAppointment);
      
      this.eventPublisher.publish(new AppointmentStartedEvent(
        appointmentId, 
        { startedBy }
      ));
    } catch (error) {
      ErrorHandler.handleAppError(error, 'StartAppointmentUseCase');
    }
  }
}
