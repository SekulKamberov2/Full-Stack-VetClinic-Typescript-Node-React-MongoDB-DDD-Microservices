import { Appointment, AppointmentProps, AppointmentStatus } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import { AppointmentModel, AppointmentDocument } from './models/AppointmentModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoAppointmentRepository implements AppointmentRepository {
  private model: typeof AppointmentModel;

  constructor() {
    this.model = AppointmentModel;
  }

  async findById(id: string): Promise<Appointment | null> {
    try {
      const appointmentDoc = await this.model.findById(id).exec();
      return appointmentDoc ? this.toEntity(appointmentDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByClientId(clientId: string): Promise<Appointment[]> {
    try {
      const appointmentDocs = await this.model.find({ clientId })
        .sort({ appointmentDate: -1 })
        .exec();
      return appointmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByClientId');
    }
  }

  async findByVeterinarianId(veterinarianId: string): Promise<Appointment[]> {
    try {
      const appointmentDocs = await this.model.find({ veterinarianId })
        .sort({ appointmentDate: -1 })
        .exec();
      return appointmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByVeterinarianId');
    }
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    try {
      const appointmentDocs = await this.model.findByDateRange(startDate, endDate);
      return appointmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByDateRange');
    }
  }

  async findByVeterinarianIdAndDateRange(
    veterinarianId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Appointment[]> {
    try {
      const appointmentDocs = await this.model.findByVeterinarianAndDateRange(
        veterinarianId, 
        startDate, 
        endDate
      );
      return appointmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByVeterinarianIdAndDateRange');
    }
  }

  async findConflictingAppointments(
    veterinarianId: string,
    appointmentDate: Date,
    duration: number
  ): Promise<Appointment[]> {
    try {
      const appointmentDocs = await this.model.findConflictingAppointments(
        veterinarianId,
        appointmentDate,
        duration
      );
      return appointmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findConflictingAppointments');
    }
  }

  async save(appointment: Appointment): Promise<Appointment> {
    try {
      if (!appointment.id || appointment.id === '') {
        const appointmentDoc = new this.model(this.toDocument(appointment));
        const savedDoc = await appointmentDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        appointment.id,
        this.toDocument(appointment),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Appointment with ID ${appointment.id} not found`,
          undefined,
          'AppointmentRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async update(appointment: Appointment): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        appointment.id, 
        this.toDocument(appointment), 
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Appointment with ID ${appointment.id} not found`,
          undefined,
          'AppointmentRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'update');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundError(
          `Appointment with ID ${id} not found`,
          undefined,
          'AppointmentRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
    }
  }

  async exists(id: string): Promise<boolean> {
    try {
      const count = await this.model.countDocuments({ _id: id }).exec();
      return count > 0;
    } catch (error) {
      this.handleDatabaseError(error, 'exists');
    }
  }

  private toEntity(doc: AppointmentDocument): Appointment {
    const props: AppointmentProps = {
      id: doc._id.toString(),
      clientId: doc.clientId,
      patientId: doc.patientId,
      veterinarianId: doc.veterinarianId,
      appointmentDate: doc.appointmentDate,
      duration: doc.duration,
      status: doc.status as AppointmentStatus,
      reason: doc.reason,
      notes: doc.notes,
      cancelledBy: doc.cancelledBy,
      cancellationReason: doc.cancellationReason,
      confirmedBy: doc.confirmedBy,
      completedBy: doc.completedBy,
      completedNotes: doc.completedNotes,
      startedBy: doc.startedBy,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
    return Appointment.create(props);
  }

  private toDocument(appointment: Appointment): Partial<AppointmentDocument> {
    return {
      clientId: appointment.clientId,
      patientId: appointment.patientId,
      veterinarianId: appointment.veterinarianId,
      appointmentDate: appointment.appointmentDate,
      duration: appointment.duration,
      status: appointment.status,
      reason: appointment.reason,
      notes: appointment.notes,
      cancelledBy: appointment.cancelledBy,
      cancellationReason: appointment.cancellationReason,
      confirmedBy: appointment.confirmedBy,
      completedBy: appointment.completedBy,
      completedNotes: appointment.completedNotes,
      startedBy: appointment.startedBy,
      updatedAt: new Date()
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoAppointmentRepository.${operation}`;
    
    if (AppError.isAppError(error)) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ValidationError(
        `Database validation failed: ${error.message}`,
        error,
        context
      );
    }
    
    if (error instanceof Error && error.name === 'CastError') {
      throw new ValidationError(
        'Invalid ID format',
        error,
        context
      );
    }
    
    if (this.isDuplicateKeyError(error)) {
      throw new AppError(
        'Duplicate appointment detected',
        'DUPLICATE_APPOINTMENT',
        error,
        context
      );
    }
    
    throw new AppError(
      `Database operation failed: ${operation}`,
      'DATABASE_OPERATION_FAILED',
      error,
      context
    );
  }

  private isDuplicateKeyError(error: unknown): boolean {
    return error instanceof Error && 
           'code' in error && 
           error.code === 11000;
  }

  async countByStatus(status: AppointmentStatus): Promise<number> {
    try {
      return await this.model.countDocuments({ status }).exec();
    } catch (error) {
      this.handleDatabaseError(error, 'countByStatus');
    }
  }

  async findByStatus(status: AppointmentStatus): Promise<Appointment[]> {
    try {
      const appointmentDocs = await this.model.find({ status })
        .sort({ appointmentDate: 1 })
        .exec();
      return appointmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByStatus');
    }
  }

  async getUpcomingAppointments(days: number = 7): Promise<Appointment[]> {
    try {
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + days);
      
      const appointmentDocs = await this.model.find({
        appointmentDate: { $gte: startDate, $lte: endDate },
        status: { $in: [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED] }
      }).sort({ appointmentDate: 1 }).exec();
      
      return appointmentDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'getUpcomingAppointments');
    }
  } 
}
