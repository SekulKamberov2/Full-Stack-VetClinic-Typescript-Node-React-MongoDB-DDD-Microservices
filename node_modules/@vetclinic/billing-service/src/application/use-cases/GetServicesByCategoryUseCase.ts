import { Service } from '../../domain/entities/Service';
import { ServiceRepository, ServiceCategory } from '../../domain/repositories/ServiceRepository';

export class GetServicesByCategoryUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(category: ServiceCategory): Promise<Service[]> {
    return this.serviceRepository.findByCategory(category);
  }
}