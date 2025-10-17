import amqp from 'amqplib';
import { EventHandlers } from './EventHandlers';

export class EventConsumer {
  private connection: amqp.Connection | null = null;
  private channel: amqp.Channel | null = null;

  constructor(
    private rabbitmqUrl: string,
    private eventHandlers: EventHandlers
  ) {}

  async connect(): Promise<void> {
    this.connection = await amqp.connect(this.rabbitmqUrl);
    this.channel = await this.connection.createChannel();
  }

  async startConsuming(): Promise<void> {
    if (!this.channel) {
      throw new Error('Channel not initialized');
    }
 
    const exchanges = [
      'owner_events',
      'visit_events', 
      'allergy_events',
      'vaccination_events',
      'patient_note_events'
    ];

    for (const exchange of exchanges) {
      await this.channel.assertExchange(exchange, 'fanout', { durable: true });
      const queue = `patient_service_${exchange}`;
      await this.channel.assertQueue(queue, { durable: true });
      await this.channel.bindQueue(queue, exchange, '');

      this.channel.consume(queue, async (msg) => {
        if (msg) {
          try {
            const content = JSON.parse(msg.content.toString());
            await this.routeMessage(exchange, content);
            this.channel?.ack(msg);
          } catch (error) {
            console.error('Error processing message:', error);
            this.channel?.nack(msg, false, false);
          }
        }
      });
    }
  }

  private async routeMessage(exchange: string, message: any): Promise<void> {
    switch (exchange) { 
      case 'visit_events':
        if (message.type === 'VisitUpdated') {
          await this.eventHandlers.handleVisitUpdatedEvent(message);
        }
        break;
      case 'allergy_events':
        if (message.type === 'AllergyUpdated') {
          await this.eventHandlers.handleAllergyUpdatedEvent(message);
        }
        break;
      case 'vaccination_events':
        if (message.type === 'VaccinationUpdated') {
          await this.eventHandlers.handleVaccinationUpdatedEvent(message);
        }
        break;
      case 'patient_note_events':
        if (message.type === 'PatientNoteUpdated') {
          await this.eventHandlers.handlePatientNoteUpdatedEvent(message);
        }
        break;
      default:
        console.warn(`Unknown exchange: ${exchange}`);
    }
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