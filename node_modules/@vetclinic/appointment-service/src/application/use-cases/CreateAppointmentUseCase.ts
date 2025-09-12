import { Appointment, AppointmentStatus } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';
import { AppointmentCreatedEvent } from '../../domain/events/AppointmentEvents';
import { ValidationError, ErrorHandler } from '@vetclinic/shared-kernel';

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
    try {
      await this.validateAppointmentData(appointmentData);
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
    } catch (error) {
      ErrorHandler.handleAppError(error, 'CreateAppointmentUseCase');
    }
  }

  private async validateAppointmentData(data: any): Promise<void> {
    const requiredFields = ['clientId', 'patientId', 'veterinarianId', 'appointmentDate', 'duration', 'reason'];
    
    for (const field of requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        throw new ValidationError(
          `${field} is required`,
          undefined,
          'CreateAppointmentUseCase'
        );
      }
    }

    if (data.duration < 5 || data.duration > 480) {
      throw new ValidationError(
        'Duration must be between 5 and 480 minutes',
        undefined,
        'CreateAppointmentUseCase'
      );
    }

    if (data.appointmentDate <= new Date()) {
      throw new ValidationError(
        'Appointment date must be in the future',
        undefined,
        'CreateAppointmentUseCase'
      );
    }
  }

  private async checkVeterinarianAvailability(
    veterinarianId: string, 
    appointmentDate: Date, 
    duration: number
  ): Promise<void> {
    const startTime = new Date(appointmentDate);
    const endTime = new Date(appointmentDate.getTime() + duration * 60000);

    const existingAppointments = await this.appointmentRepository.findConflictingAppointments(
      veterinarianId,
      startTime,
      duration
    );

    if (existingAppointments.length > 0) {
      throw new ValidationError(
        'Veterinarian is not available at the requested time. Please choose a different time slot.',
        undefined,
        'CreateAppointmentUseCase'
      );
    }
  }
}
