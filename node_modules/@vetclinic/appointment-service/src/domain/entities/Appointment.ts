import { ValidationError } from "@vetclinic/shared-kernel";

export interface AppointmentProps {
  id?: string;
  clientId: string;
  patientId: string;
  veterinarianId: string;
  appointmentDate: Date;
  duration: number;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  cancelledBy?: string;
  cancellationReason?: string;
  confirmedBy?: string;
  completedBy?: string;
  completedNotes?: string;
  startedBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum AppointmentStatus {
  SCHEDULED = 'SCHEDULED',
  CONFIRMED = 'CONFIRMED',
  IN_PROGRESS = 'IN_PROGRESS',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  NO_SHOW = 'NO_SHOW'
}

export class Appointment {
  public readonly id: string;
  public readonly clientId: string;
  public readonly patientId: string;
  public readonly veterinarianId: string;
  public readonly appointmentDate: Date;
  public readonly duration: number;
  public readonly status: AppointmentStatus;
  public readonly reason: string;
  public readonly notes?: string;
  public readonly cancelledBy?: string;
  public readonly cancellationReason?: string;
  public readonly confirmedBy?: string;
  public readonly completedBy?: string;
  public readonly completedNotes?: string;
  public readonly startedBy?: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: AppointmentProps) {  
    this.id = props.id || ''; 
    this.clientId = props.clientId;
    this.patientId = props.patientId;
    this.veterinarianId = props.veterinarianId;
    this.appointmentDate = props.appointmentDate;
    this.duration = props.duration;
    this.status = props.status;
    this.reason = props.reason;
    this.notes = props.notes;
    this.cancelledBy = props.cancelledBy;
    this.cancellationReason = props.cancellationReason;
    this.confirmedBy = props.confirmedBy;
    this.completedBy = props.completedBy;
    this.completedNotes = props.completedNotes;
    this.startedBy = props.startedBy;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: Omit<AppointmentProps, 'id'>): Appointment { 
    return new Appointment({
      id: '', 
      ...props
    });
  }

  public static validate(props: Partial<AppointmentProps>): void {
    if (props.reason && (!props.reason || props.reason.trim() === '')) {
      throw new ValidationError("Reason is required", undefined, 'Appointment validation');
    }

    if (props.reason && props.reason.length > 500) {
      throw new ValidationError("Reason cannot exceed 500 characters", undefined, 'Appointment validation');
    }

    if (props.notes && props.notes.length > 1000) {
      throw new ValidationError("Notes cannot exceed 1000 characters", undefined, 'Appointment validation');
    }

    if (props.cancellationReason && props.cancellationReason.length > 500) {
      throw new ValidationError("Cancellation reason cannot exceed 500 characters", undefined, 'Appointment validation');
    }

    if (props.completedNotes && props.completedNotes.length > 1000) {
      throw new ValidationError("Completed notes cannot exceed 1000 characters", undefined, 'Appointment validation');
    }

    if (props.duration && (props.duration < 5 || props.duration > 480)) {
      throw new ValidationError("Duration must be between 5 and 480 minutes", undefined, 'Appointment validation');
    }
  }

  public confirm(confirmedBy: string): Appointment {
    if (this.status !== AppointmentStatus.SCHEDULED) {
      throw new ValidationError('Only scheduled appointments can be confirmed', undefined, 'Appointment validation');
    }
    return new Appointment({
      ...this.toProps(),
      status: AppointmentStatus.CONFIRMED,
      confirmedBy,
      updatedAt: new Date(),
    });
  }

  public cancel(cancelledBy: string, reason?: string): Appointment {
    if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(this.status)) {
      throw new ValidationError('Cannot cancel completed or already cancelled appointment', undefined, 'Appointment validation');
    }
    return new Appointment({
      ...this.toProps(),
      status: AppointmentStatus.CANCELLED,
      cancelledBy,
      cancellationReason: reason,
      updatedAt: new Date(),
    });
  }

  public complete(completedBy: string, notes?: string): Appointment {
    if (this.status !== AppointmentStatus.IN_PROGRESS) {
      throw new ValidationError('Only appointments in progress can be completed', undefined, 'Appointment validation');
    }
    return new Appointment({
      ...this.toProps(),
      status: AppointmentStatus.COMPLETED,
      completedBy,
      completedNotes: notes,
      updatedAt: new Date(),
    });
  }

  public markAsNoShow(): Appointment {
    if (this.status !== AppointmentStatus.SCHEDULED && this.status !== AppointmentStatus.CONFIRMED) {
      throw new ValidationError('Only scheduled or confirmed appointments can be marked as no-show', undefined, 'Appointment validation');
    }
    return new Appointment({
      ...this.toProps(),
      status: AppointmentStatus.NO_SHOW,
      updatedAt: new Date(),
    });
  }

  public updateNotes(notes: string): Appointment {
    if (notes.length > 1000) {
      throw new ValidationError("Notes cannot exceed 1000 characters", undefined, 'Appointment validation');
    }
    return new Appointment({
      ...this.toProps(),
      notes,
      updatedAt: new Date(),
    });
  }

  public start(startedBy: string): Appointment {
    if (this.status !== AppointmentStatus.CONFIRMED) {
      throw new ValidationError('Only confirmed appointments can be started', undefined, 'Appointment validation');
    }
    return new Appointment({
      ...this.toProps(),
      status: AppointmentStatus.IN_PROGRESS,
      startedBy,
      updatedAt: new Date(),
    });
  }

  public toProps(): AppointmentProps {
    return {
      id: this.id,
      clientId: this.clientId,
      patientId: this.patientId,
      veterinarianId: this.veterinarianId,
      appointmentDate: this.appointmentDate,
      duration: this.duration,
      status: this.status,
      reason: this.reason,
      notes: this.notes,
      cancelledBy: this.cancelledBy,
      cancellationReason: this.cancellationReason,
      confirmedBy: this.confirmedBy,
      completedBy: this.completedBy,
      completedNotes: this.completedNotes,
      startedBy: this.startedBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public isValid(): boolean {
    return this.reason.trim() !== '' && 
           this.reason.length <= 500 &&
           (!this.notes || this.notes.length <= 1000) &&
           (!this.cancellationReason || this.cancellationReason.length <= 500) &&
           (!this.completedNotes || this.completedNotes.length <= 1000) &&
           this.duration >= 5 &&
           this.duration <= 480 &&
           this.appointmentDate > new Date();
  }

  public isUpcoming(): boolean {
    const now = new Date();
    return this.appointmentDate > now && 
           [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(this.status);
  }

  public isPast(): boolean {
    const now = new Date();
    return this.appointmentDate <= now;
  }

  public canBeModified(): boolean {
    return [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(this.status);
  }
}
