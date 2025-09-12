import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class DeleteClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: string): Promise<void> {
    try {
      const existingClient = await this.clientRepository.findById(id);
      if (!existingClient) {
        throw new NotFoundError(
          `Client with ID ${id} not found`,
          undefined,
          'DeleteClientUseCase'
        );
      }

      await this.clientRepository.delete(id);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Delete client') as never;
    }
  }
}
