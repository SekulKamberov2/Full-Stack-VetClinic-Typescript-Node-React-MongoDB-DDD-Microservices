import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(clientId: string): Promise<Client> {
    try { 
      const client = await this.clientRepository.findById(clientId);
      if (!client) {
        throw new NotFoundError(
          `Client with ID ${clientId} not found`,
          undefined,
          'GetClientUseCase'
        );
      }
      return client;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get client') as never;
    }
  }
}
