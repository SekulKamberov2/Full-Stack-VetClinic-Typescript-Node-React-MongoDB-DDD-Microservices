import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetAllClientsUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(): Promise<Client[]> {
    try {
      return await this.clientRepository.findAll();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get all clients') as never;
    }
  }
}