export interface DomainEvent {
  type: string;
  aggregateId: string;
  occurredOn: Date;
  payload: any;
}

export class AppointmentCreatedEvent implements DomainEvent {
  readonly type = 'AppointmentCreated';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      clientId: string;
      patientId: string;
      veterinarianId: string;
      appointmentDate: Date;
      duration: number;
      reason: string;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class AppointmentStartedEvent implements DomainEvent {
  readonly type = 'AppointmentStarted';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      startedBy: string;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class AppointmentCancelledEvent implements DomainEvent {
  readonly type = 'AppointmentCancelled';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      cancelledBy: string;
      reason?: string;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class AppointmentCompletedEvent implements DomainEvent {
  readonly type = 'AppointmentCompleted';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      completedBy: string;
      notes?: string;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class AppointmentConfirmedEvent implements DomainEvent {
  readonly type = 'AppointmentConfirmed';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      confirmedBy: string;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}