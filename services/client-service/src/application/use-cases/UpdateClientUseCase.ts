import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

export class UpdateClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: string, clientData: Partial<{
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
  }>): Promise<Client> {
    const existingClient = await this.clientRepository.findById(id);
    if (!existingClient) {
      throw new Error('Client not found');
    }

    const updatedClient = existingClient.update(clientData);
    await this.clientRepository.update(updatedClient);
    return updatedClient;
  }
}