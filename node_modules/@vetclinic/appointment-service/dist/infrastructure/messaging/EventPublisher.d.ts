import { DomainEvent } from '../../domain/events/AppointmentEvents';
export declare class EventPublisher {
    private readonly rabbitmqUrl;
    private connection;
    private channel;
    constructor(rabbitmqUrl: string);
    connect(): Promise<void>;
    publish(event: DomainEvent): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=EventPublisher.d.ts.map