import { Pet } from '../../../domain/entities/Pet';
import { PetRepository } from '../../../domain/repositories/PetRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetPetUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(petId: string): Promise<Pet> {
    try {
      const pet = await this.petRepository.findById(petId);
      if (!pet) {
        throw new NotFoundError(
          `Pet with ID ${petId} not found`,
          undefined,
          'GetPetUseCase'
        );
      }
      return pet;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get pet') as never;
    }
  }
}
