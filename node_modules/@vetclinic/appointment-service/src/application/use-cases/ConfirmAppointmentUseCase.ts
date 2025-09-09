import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
import { AppointmentConfirmedEvent } from '../../domain/events/AppointmentEvents';

export class ConfirmAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(appointmentId: string, confirmedBy: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');
     
    const confirmedAppointment = appointment.confirm();
     
    await this.appointmentRepository.save(confirmedAppointment);
    
    this.eventPublisher.publish(new AppointmentConfirmedEvent(
      appointmentId, 
      { confirmedBy }
    ));
  }
}