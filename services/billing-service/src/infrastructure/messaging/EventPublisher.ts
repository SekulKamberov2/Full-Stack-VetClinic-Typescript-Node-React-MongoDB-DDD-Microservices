import amqp from 'amqplib';
import { EventPublisher as IEventPublisher } from '../../shared/domain/EventPublisher';
import { DomainEvent } from '../../domain/events/BillingEvents';

export class EventPublisher implements IEventPublisher {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private readonly rabbitmqUrl: string) {}

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.rabbitmqUrl);
    this.channel = await this.connection.createChannel();
    await this.channel.assertExchange('billing_events', 'topic', { durable: true });
  }

  async publish(event: DomainEvent): Promise<void> {
    if (!this.channel) {
      throw new Error('RabbitMQ channel not initialized');
    }

    this.channel.publish(
      'billing_events',
      event.type,
      Buffer.from(JSON.stringify({
        ...event,
        occurredOn: event.occurredOn.toISOString()
      })),
      { persistent: true }
    );
  }

  async disconnect(): Promise<void> {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
  }
}
