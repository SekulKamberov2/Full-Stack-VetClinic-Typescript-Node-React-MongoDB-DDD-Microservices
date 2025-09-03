import { Service } from '../../domain/entities/Service';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';

export class FindAllActiveServicesUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(): Promise<Service[]> {
    return this.serviceRepository.findAllActive();
  }
}