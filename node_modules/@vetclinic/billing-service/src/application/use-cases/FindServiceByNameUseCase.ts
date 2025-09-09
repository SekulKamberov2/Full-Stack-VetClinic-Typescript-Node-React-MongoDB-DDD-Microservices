import { Service } from '../../domain/entities/Service';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';

export class FindServiceByNameUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(name: string): Promise<Service[] | null> {
    return this.serviceRepository.findByName(name);
  }
}