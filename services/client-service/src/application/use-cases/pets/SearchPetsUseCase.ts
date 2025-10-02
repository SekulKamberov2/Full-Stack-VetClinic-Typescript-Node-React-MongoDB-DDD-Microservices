import { Pet } from '../../../domain/entities/Pet';
import { PetRepository } from '../../../domain/repositories/PetRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class SearchPetsUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(query: string): Promise<Pet[]> {
    try {
      if (!query || query.trim() === '') {
        throw new Error("Search query cannot be empty");
      }
      return await this.petRepository.searchPets(query);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Search pets') as never;
    }
  }
}