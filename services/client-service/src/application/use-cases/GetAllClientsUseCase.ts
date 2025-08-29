import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';

export class GetAllClientsUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(): Promise<Client[]> {
    return this.clientRepository.findAll();
  }
}