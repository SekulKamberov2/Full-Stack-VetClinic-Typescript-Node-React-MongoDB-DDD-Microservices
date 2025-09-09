import { DomainEvent } from '../../domain/events/MedicalRecordEvents';
import { EventPublisher } from '../../shared/domain/EventPublisher';
export declare class RabbitMQEventPublisher implements EventPublisher {
    private readonly rabbitmqUrl;
    private connection;
    private channel;
    readonly exchangeName: string;
    private isConnected;
    constructor(rabbitmqUrl: string, exchangeName?: string);
    connect(retries?: number, delay?: number): Promise<void>;
    publish(event: DomainEvent): Promise<void>;
    disconnect(): Promise<void>;
    private cleanup;
    getConnectionStatus(): {
        isConnected: boolean;
        hasChannel: boolean;
    };
    healthCheck(): Promise<boolean>;
    ensureConnection(retries?: number, delay?: number): Promise<void>;
}
//# sourceMappingURL=RabbitMQEventPublisher.d.ts.map