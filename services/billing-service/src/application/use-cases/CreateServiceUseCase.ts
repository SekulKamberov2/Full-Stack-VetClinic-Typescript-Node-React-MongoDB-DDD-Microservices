import { Service } from '../../domain/entities/Service';
import { ServiceRepository } from '../../domain/repositories/ServiceRepository';

export class CreateServiceUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(serviceData: {
    name: string;
    description: string;
    category: string;
    price: number;
    duration: number;
  }): Promise<Service> {
    const service = Service.create(serviceData);
    const savedService = await this.serviceRepository.save(service);
    
    return savedService;
  }
}