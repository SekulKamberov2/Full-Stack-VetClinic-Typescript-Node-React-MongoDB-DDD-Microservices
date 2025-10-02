import { Pet } from '../../../domain/entities/Pet';
import { PetRepository } from '../../../domain/repositories/PetRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetAllPetsUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(): Promise<Pet[]> {
    try {
      return await this.petRepository.findAll();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get all pets') as never;
    }
  }
}
