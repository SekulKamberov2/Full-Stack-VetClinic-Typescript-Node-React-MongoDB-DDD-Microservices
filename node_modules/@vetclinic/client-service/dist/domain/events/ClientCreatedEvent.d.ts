export interface DomainEvent {
    type: string;
    aggregateId: string;
    occurredOn: Date;
    payload: any;
}
export declare class ClientCreatedEvent implements DomainEvent {
    readonly aggregateId: string;
    readonly payload: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    };
    readonly occurredOn: Date;
    readonly type = "ClientCreated";
    constructor(aggregateId: string, payload: {
        firstName: string;
        lastName: string;
        email: string;
        phone: string;
    }, occurredOn?: Date);
}
