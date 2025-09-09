import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
import { AppointmentCancelledEvent } from '../../domain/events/AppointmentEvents';
 
export class CancelAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(appointmentId: string, cancelledBy: string, reason?: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');
     
    const cancelledAppointment = appointment.cancel(reason);
    await this.appointmentRepository.save(cancelledAppointment);
    
    this.eventPublisher.publish(new AppointmentCancelledEvent(
      appointmentId, 
      { cancelledBy, reason }
    ));
  }
}