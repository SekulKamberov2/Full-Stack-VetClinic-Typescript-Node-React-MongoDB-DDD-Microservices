import amqp from 'amqplib';

export class EventConsumer {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(private rabbitmqUrl: string) {}

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.rabbitmqUrl);
    this.channel = await this.connection.createChannel();
  }

  async consume(queue: string, exchange: string, callback: (message: any) => void): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }

    await this.channel.assertExchange(exchange, 'fanout', { durable: true });
    await this.channel.assertQueue(queue, { durable: true });
    await this.channel.bindQueue(queue, exchange, '');

    this.channel.consume(queue, (msg) => {
      if (msg) {
        const content = JSON.parse(msg.content.toString());
        callback(content);
        this.channel?.ack(msg);
      }
    });
  }

  async disconnect(): Promise<void> {
    if (this.channel) {
      await this.channel.close();
    }
    if (this.connection) {
      await this.connection.close();
    }
  }
}