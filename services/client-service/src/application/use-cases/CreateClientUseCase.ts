import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { EventPublisher } from '../../infrastructure/messaging/EventPublisher';

export class CreateClientUseCase {
  constructor(
    private clientRepository: ClientRepository,
    private eventPublisher: EventPublisher
  ) {}

  async execute(clientData: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }): Promise<Client> { 
    
    const existingClient = await this.clientRepository.findByEmail(clientData.email);
    if (existingClient) {
      throw new Error('Client with this email already exists');
    }
 
    const client = Client.create(clientData);
    const savedClient = await this.clientRepository.save(client);

    // Publish domain event with actual MongoDB ID
    // await this.eventPublisher.publish('ClientCreated', {
    //   clientId: savedClient.id,  // Use the ID from saved client
    //   firstName: savedClient.firstName,
    //   lastName: savedClient.lastName,
    //   email: savedClient.email,
    //   phone: savedClient.phone,
    // });

    return savedClient;  
  }
}