import { EventHandler } from './handlers/EventHandler';
import amqp, { Channel, Connection } from 'amqplib';

export class EventConsumer {
  private connection: Connection | null = null;
  private channel: Channel | null = null;
  private handlers: Map<string, EventHandler[]> = new Map();

  constructor(private rabbitmqUrl: string) {}

  registerHandler(eventType: string, handler: EventHandler): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    this.handlers.get(eventType)!.push(handler);
    console.log(`Registered handler for event: ${eventType}`);
  }

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      
      await this.channel.assertExchange('client_events', 'fanout', { durable: true });
      console.log('EventConsumer connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async startConsuming(): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const exchange = 'client_events';
      const queue = 'client_service_queue';

      await this.channel!.assertExchange(exchange, 'fanout', { durable: true });
      const q = await this.channel!.assertQueue(queue, { durable: true });
      await this.channel!.bindQueue(q.queue, exchange, '');

      await this.channel!.consume(
        q.queue,
        async (message) => {
          if (!message) return;

          try {
            const event = JSON.parse(message.content.toString());
            console.log('Processing event:', event.type);

            const handlers = this.handlers.get(event.type) || [];

            for (const handler of handlers) {
              await handler.handle(event);
            }

            this.channel!.ack(message);
          } catch (error) {
            console.error('Error processing event:', error);
            this.channel!.nack(message, false, false);
          }
        },
        { noAck: false }
      );

      console.log('Event consumer started and listening for client events');
    } catch (error) {
      console.error('Failed to start event consumer:', error);
    }
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
    console.log('Event consumer disconnected');
  }

  isConnected(): boolean {
    return this.channel !== null && this.connection !== null;
  }
}
