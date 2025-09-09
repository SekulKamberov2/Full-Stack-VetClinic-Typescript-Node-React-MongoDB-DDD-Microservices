import { Service } from '../../domain/entities/Service';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';

export class SearchServicesUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(query: string): Promise<Service[]> {
    return this.serviceRepository.search(query);
  }
}