import { ServiceRepository } from '../../domain/repositories/ServiceRepository';

export class GetServiceStatsUseCase {
  constructor(private serviceRepository: ServiceRepository) {}

  async execute(): Promise<{
    totalServices: number;
    activeServices: number;
    servicesByCategory: Record<string, number>;
  }> {
    return this.serviceRepository.getStats();
  }
}