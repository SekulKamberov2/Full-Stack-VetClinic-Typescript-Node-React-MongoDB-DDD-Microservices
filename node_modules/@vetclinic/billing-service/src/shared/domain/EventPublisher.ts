import { DomainEvent } from '../../domain/events/BillingEvents';

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}