import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
import { AppointmentStartedEvent } from '../../domain/events/AppointmentEvents';

export class StartAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(appointmentId: string, startedBy: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');
    
    const startedAppointment = appointment.start();
    await this.appointmentRepository.save(startedAppointment);
    
    this.eventPublisher.publish(new AppointmentStartedEvent(
      appointmentId, 
      { startedBy }
    ));
  }
}