import { DomainEvent } from '../../domain/events/MedicalRecordEvents';

export interface EventPublisher {
  exchangeName?: string;
  connect(): Promise<void>;
  publish(event: DomainEvent): Promise<void>;
  disconnect(): Promise<void>;
}
