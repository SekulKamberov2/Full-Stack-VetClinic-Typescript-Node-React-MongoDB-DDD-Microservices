export interface DomainEvent {
    type: string;
    aggregateId: string;
    occurredOn: Date;
    payload: any;
}
export declare class MedicalRecordCreatedEvent implements DomainEvent {
    readonly aggregateId: string;
    readonly payload: {
        patientId: string;
        clientId: string;
        veterinarianId: string;
        appointmentId?: string;
    };
    readonly occurredOn: Date;
    readonly type = "MedicalRecordCreated";
    constructor(aggregateId: string, payload: {
        patientId: string;
        clientId: string;
        veterinarianId: string;
        appointmentId?: string;
    }, occurredOn?: Date);
}
export declare class DiagnosisAddedEvent implements DomainEvent {
    readonly aggregateId: string;
    readonly payload: {
        diagnosisId: string;
        description: string;
        notes?: string;
    };
    readonly occurredOn: Date;
    readonly type = "DiagnosisAdded";
    constructor(aggregateId: string, payload: {
        diagnosisId: string;
        description: string;
        notes?: string;
    }, occurredOn?: Date);
}
export declare class TreatmentAddedEvent implements DomainEvent {
    readonly aggregateId: string;
    readonly payload: {
        treatmentId: string;
        name: string;
        description: string;
        cost: number;
    };
    readonly occurredOn: Date;
    readonly type = "TreatmentAdded";
    constructor(aggregateId: string, payload: {
        treatmentId: string;
        name: string;
        description: string;
        cost: number;
    }, occurredOn?: Date);
}
export declare class PrescriptionAddedEvent implements DomainEvent {
    readonly aggregateId: string;
    readonly payload: {
        prescriptionId: string;
        medicationName: string;
        dosage: string;
        instructions: string;
        refills: number;
    };
    readonly occurredOn: Date;
    readonly type = "PrescriptionAdded";
    constructor(aggregateId: string, payload: {
        prescriptionId: string;
        medicationName: string;
        dosage: string;
        instructions: string;
        refills: number;
    }, occurredOn?: Date);
}
export declare class MedicalRecordUpdatedEvent implements DomainEvent {
    readonly aggregateId: string;
    readonly payload: {
        updatedFields: string[];
        notes?: string;
    };
    readonly occurredOn: Date;
    readonly type = "MedicalRecordUpdated";
    constructor(aggregateId: string, payload: {
        updatedFields: string[];
        notes?: string;
    }, occurredOn?: Date);
}
//# sourceMappingURL=MedicalRecordEvents.d.ts.map