import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
import { AppointmentCompletedEvent } from '../../domain/events/AppointmentEvents';
 
export class CompleteAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(appointmentId: string, completedBy: string, notes?: string): Promise<void> {
    const appointment = await this.appointmentRepository.findById(appointmentId);
    if (!appointment) throw new Error('Appointment not found');
    
    console.log('Current appointment status:', appointment.status);
     
    const completedAppointment = appointment.complete();
     
    const finalAppointment = notes ? completedAppointment.updateNotes(notes) : completedAppointment;
    
    await this.appointmentRepository.save(finalAppointment);
    
    this.eventPublisher.publish(new AppointmentCompletedEvent(
      appointmentId, 
      { completedBy, notes }
    ));
  }
}