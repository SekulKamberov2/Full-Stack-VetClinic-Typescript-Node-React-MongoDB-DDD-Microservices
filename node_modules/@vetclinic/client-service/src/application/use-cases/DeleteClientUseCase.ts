import { ClientRepository } from '../../domain/repositories/ClientRepository';

export class DeleteClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: string): Promise<void> {
    const existingClient = await this.clientRepository.findById(id);
    if (!existingClient) {
      throw new Error('Client not found');
    }

    await this.clientRepository.delete(id);
  }
}