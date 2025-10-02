import amqp from 'amqplib';

export class EventPublisher {
  private connection: any = null;
  private channel: any = null;

  constructor(private rabbitmqUrl: string) {}

  async connect(): Promise<void> {
    try {
      this.connection = await amqp.connect(this.rabbitmqUrl);
      this.channel = await this.connection.createChannel();
      console.log('Connected to RabbitMQ');
    } catch (error) {
      console.error('Failed to connect to RabbitMQ:', error);
      throw error;
    }
  }

  async publish(exchange: string, message: any): Promise<boolean> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      await this.channel.assertExchange(exchange, 'fanout', { durable: true });
      const success = this.channel.publish(
        exchange, 
        '', 
        Buffer.from(JSON.stringify(message)), 
        { persistent: true }
      );
      
      console.log(`Event published to ${exchange}:`, message.type);
      return success;
    } catch (error) {
      console.error('Failed to publish event:', error);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      console.log('EventPublisher disconnected from RabbitMQ');
    } catch (error) {
      console.error('Error disconnecting from RabbitMQ:', error);
    }
  }
}
