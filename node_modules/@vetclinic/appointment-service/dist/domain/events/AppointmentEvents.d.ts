export interface DomainEvent {
    type: string;
    aggregateId: string;
    occurredOn: Date;
    payload: any;
}
export declare class AppointmentCreatedEvent implements DomainEvent {
    readonly aggregateId: string;
    readonly payload: {
        clientId: string;
        patientId: string;
        veterinarianId: string;
        appointmentDate: Date;
        duration: number;
        reason: string;
    };
    readonly occurredOn: Date;
    readonly type = "AppointmentCreated";
    constructor(aggregateId: string, payload: {
        clientId: string;
        patientId: string;
        veterinarianId: string;
        appointmentDate: Date;
        duration: number;
        reason: string;
    }, occurredOn?: Date);
}
export declare class AppointmentStartedEvent implements DomainEvent {
    readonly aggregateId: string;
    readonly payload: {
        startedBy: string;
    };
    readonly occurredOn: Date;
    readonly type = "AppointmentStarted";
    constructor(aggregateId: string, payload: {
        startedBy: string;
    }, occurredOn?: Date);
}
export declare class AppointmentCancelledEvent implements DomainEvent {
    readonly aggregateId: string;
    readonly payload: {
        cancelledBy: string;
        reason?: string;
    };
    readonly occurredOn: Date;
    readonly type = "AppointmentCancelled";
    constructor(aggregateId: string, payload: {
        cancelledBy: string;
        reason?: string;
    }, occurredOn?: Date);
}
export declare class AppointmentCompletedEvent implements DomainEvent {
    readonly aggregateId: string;
    readonly payload: {
        completedBy: string;
        notes?: string;
    };
    readonly occurredOn: Date;
    readonly type = "AppointmentCompleted";
    constructor(aggregateId: string, payload: {
        completedBy: string;
        notes?: string;
    }, occurredOn?: Date);
}
export declare class AppointmentConfirmedEvent implements DomainEvent {
    readonly aggregateId: string;
    readonly payload: {
        confirmedBy: string;
    };
    readonly occurredOn: Date;
    readonly type = "AppointmentConfirmed";
    constructor(aggregateId: string, payload: {
        confirmedBy: string;
    }, occurredOn?: Date);
}
//# sourceMappingURL=AppointmentEvents.d.ts.map