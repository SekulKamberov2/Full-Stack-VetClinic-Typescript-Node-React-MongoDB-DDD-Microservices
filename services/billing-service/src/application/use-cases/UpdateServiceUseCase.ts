import { Service } from '../../domain/entities/Service';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';

export class UpdateServiceUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(id: string, serviceData: Partial<{
    name: string;
    description: string;
    category: string;
    price: number;
    duration: number;
  }>): Promise<Service> {
    const existingService = await this.serviceRepository.findById(id);
    if (!existingService) {
      throw new Error('Service not found');
    }

    const updatedService = existingService.update(serviceData);
    await this.serviceRepository.update(updatedService);
    return updatedService;
  }
}