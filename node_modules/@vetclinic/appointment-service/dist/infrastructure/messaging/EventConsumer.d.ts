export declare class EventConsumer {
    private readonly rabbitmqUrl;
    private connection;
    private channel;
    constructor(rabbitmqUrl: string);
    connect(): Promise<void>;
    consume(queue: string, onMessage: (message: any) => void): Promise<void>;
    disconnect(): Promise<void>;
}
//# sourceMappingURL=EventConsumer.d.ts.map