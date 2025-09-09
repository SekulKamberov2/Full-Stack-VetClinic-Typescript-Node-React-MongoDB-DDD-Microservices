export interface DomainEvent {
  type: string;
  aggregateId: string;
  occurredOn: Date;
  payload: any;
}

export class MedicalRecordCreatedEvent implements DomainEvent {
  readonly type = 'MedicalRecordCreated';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      patientId: string;
      clientId: string;
      veterinarianId: string;
      appointmentId?: string;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class DiagnosisAddedEvent implements DomainEvent {
  readonly type = 'DiagnosisAdded';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      diagnosisId: string;
      description: string;
      notes?: string;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class TreatmentAddedEvent implements DomainEvent {
  readonly type = 'TreatmentAdded';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      treatmentId: string;
      name: string;
      description: string;
      cost: number;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class PrescriptionAddedEvent implements DomainEvent {
  readonly type = 'PrescriptionAdded';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      prescriptionId: string;
      medicationName: string;
      dosage: string;
      instructions: string;
      refills: number;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}

export class MedicalRecordUpdatedEvent implements DomainEvent {
  readonly type = 'MedicalRecordUpdated';
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      updatedFields: string[];
      notes?: string;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}
