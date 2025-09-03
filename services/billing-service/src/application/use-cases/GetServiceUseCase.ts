import { Service } from '../../domain/entities/Service';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';

export class GetServiceUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(id: string): Promise<Service | null> {
    return this.serviceRepository.findById(id);
  }
}