import { ServiceRepository } from '../../domain/repositories/ServiceRepository';

export class DeleteServiceUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(id: string): Promise<void> {
    const existingService = await this.serviceRepository.findById(id);
    if (!existingService) {
      throw new Error('Service not found');
    }

    await this.serviceRepository.delete(id);
  }
}