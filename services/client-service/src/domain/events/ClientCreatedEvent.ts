import { Client } from '../entities/Client';

export class ClientCreatedEvent {
  public readonly eventName = 'ClientCreated';
  public readonly timestamp: Date;
  public readonly payload: {
    clientId: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };

  constructor(client: Client) {
    this.timestamp = new Date();
    this.payload = {
      clientId: client.id,
      firstName: client.firstName,
      lastName: client.lastName,
      email: client.email,
      phone: client.phone,
    };
  }
}