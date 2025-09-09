import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

export class GetClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(clientId: string): Promise<Client | null> {
    return this.clientRepository.findById(clientId);
  }
}