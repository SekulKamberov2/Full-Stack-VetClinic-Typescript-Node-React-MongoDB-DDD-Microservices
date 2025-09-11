export declare class EventPublisher {
    private rabbitmqUrl;
    private connection;
    private channel;
    constructor(rabbitmqUrl: string);
    connect(): Promise<void>;
    publish(exchange: string, message: any): Promise<void>;
    disconnect(): Promise<void>;
}
