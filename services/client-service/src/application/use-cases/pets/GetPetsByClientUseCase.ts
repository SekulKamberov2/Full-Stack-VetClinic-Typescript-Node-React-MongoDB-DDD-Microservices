import { Pet } from '../../../domain/entities/Pet';
import { PetRepository } from '../../../domain/repositories/PetRepository';
import { ClientRepository } from '../../../domain/repositories/ClientRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetPetsByClientUseCase {
  constructor(
    private petRepository: PetRepository,
    private clientRepository: ClientRepository
  ) {}

  async execute(clientId: string): Promise<Pet[]> {
    try {
      const client = await this.clientRepository.findById(clientId);
      if (!client) {
        throw new NotFoundError(
          `Client with ID ${clientId} not found`,
          undefined,
          'GetPetsByClientUseCase'
        );
      }

      return await this.petRepository.findByClientId(clientId);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get pets by client') as never;
    }
  }
}