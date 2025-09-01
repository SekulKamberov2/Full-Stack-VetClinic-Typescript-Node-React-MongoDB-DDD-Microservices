import { DomainEvent } from '../../domain/events/AppointmentEvents';

export interface EventPublisher {
  publish(event: DomainEvent): Promise<void>;
}