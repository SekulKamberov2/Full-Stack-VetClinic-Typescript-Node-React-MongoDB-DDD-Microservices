import { PetRepository } from '../../../domain/repositories/PetRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetPetStatsUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(): Promise<{
    totalPets: number;
    activePets: number;
    petsBySpecies: Record<string, number>;
    averageAge: number;
  }> {
    try {
      return await this.petRepository.getPetStats();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get pet stats') as never;
    }
  }
}