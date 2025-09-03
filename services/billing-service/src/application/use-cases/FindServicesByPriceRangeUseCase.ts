import { Service } from '../../domain/entities/Service';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';

export class FindServicesByPriceRangeUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(minPrice: number, maxPrice: number): Promise<Service[]> {
    return this.serviceRepository.findByPriceRange(minPrice, maxPrice);
  }
}