import { Types } from 'mongoose';

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
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: Omit<AppointmentProps, 'id'>): Appointment { 
    return new Appointment({
      id: '', 
      ...props
    });
  }

  confirm(): Appointment {
    if (this.status !== AppointmentStatus.SCHEDULED) {
      throw new Error('Only scheduled appointments can be confirmed');
    }
    return new Appointment({
      ...this,
      status: AppointmentStatus.CONFIRMED,
      updatedAt: new Date(),
    });
  }

  cancel(reason?: string): Appointment {
    if ([AppointmentStatus.COMPLETED, AppointmentStatus.CANCELLED].includes(this.status)) {
      throw new Error('Cannot cancel completed or already cancelled appointment');
    }
    return new Appointment({
      ...this,
      status: AppointmentStatus.CANCELLED,
      notes: reason ? reason : this.notes,
      updatedAt: new Date(),
    });
  }

  complete(): Appointment {
    if (this.status !== AppointmentStatus.IN_PROGRESS) {
      throw new Error('Only appointments in progress can be completed');
    }
    return new Appointment({
      ...this,
      status: AppointmentStatus.COMPLETED,
      updatedAt: new Date(),
    });
  }

  markAsNoShow(): Appointment {
    if (this.status !== AppointmentStatus.SCHEDULED && this.status !== AppointmentStatus.CONFIRMED) {
      throw new Error('Only scheduled or confirmed appointments can be marked as no-show');
    }
    return new Appointment({
      ...this,
      status: AppointmentStatus.NO_SHOW,
      updatedAt: new Date(),
    });
  }

  updateNotes(notes: string): Appointment {
    return new Appointment({
      ...this,
      notes: notes,
      updatedAt: new Date(),
    });
  }

  start(): Appointment {
    if (this.status !== AppointmentStatus.CONFIRMED) {
      throw new Error('Only confirmed appointments can be started');
    }
    return new Appointment({
      ...this,
      status: AppointmentStatus.IN_PROGRESS,
      updatedAt: new Date(),
    });
  }
}