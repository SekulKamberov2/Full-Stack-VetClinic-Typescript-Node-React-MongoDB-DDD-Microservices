import { Appointment, AppointmentStatus } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
import { AppointmentCreatedEvent } from '../../domain/events/AppointmentEvents';

export class CreateAppointmentUseCase {
  constructor(
    private appointmentRepository: AppointmentRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(appointmentData: {
    clientId: string;
    patientId: string;
    veterinarianId: string;
    appointmentDate: Date;
    duration: number;
    reason: string;
    notes?: string;
  }): Promise<Appointment> {   
    await this.checkVeterinarianAvailability(
      appointmentData.veterinarianId,
      appointmentData.appointmentDate,
      appointmentData.duration
    );

    const appointment = Appointment.create({
      ...appointmentData,
      status: AppointmentStatus.SCHEDULED  
    }); 
    
    const savedAppointment = await this.appointmentRepository.save(appointment);
     
    this.eventPublisher.publish(new AppointmentCreatedEvent(
      savedAppointment.id, 
      {
        clientId: savedAppointment.clientId,
        patientId: savedAppointment.patientId,
        veterinarianId: savedAppointment.veterinarianId,
        appointmentDate: savedAppointment.appointmentDate,
        duration: savedAppointment.duration,
        reason: savedAppointment.reason
      }
    ));

    return savedAppointment;   
  }

  private async checkVeterinarianAvailability(
    veterinarianId: string, 
    appointmentDate: Date, 
    duration: number
  ): Promise<void> {
    const startTime = new Date(appointmentDate);
    const endTime = new Date(appointmentDate.getTime() + duration * 60000);

    const existingAppointments = await this.appointmentRepository.findByVeterinarianIdAndDateRange(
      veterinarianId,
      startTime,
      endTime
    );

    const hasOverlap = existingAppointments.some(existingAppt => {
      const existingStart = existingAppt.appointmentDate;
      const existingEnd = new Date(existingStart.getTime() + existingAppt.duration * 60000);
      
      return (
        (startTime >= existingStart && startTime < existingEnd) || 
        (endTime > existingStart && endTime <= existingEnd) ||     
        (startTime <= existingStart && endTime >= existingEnd)    
      );
    });

    if (hasOverlap) {
      throw new Error('Veterinarian is not available at the requested time. Please choose a different time slot.');
    }
  }
}