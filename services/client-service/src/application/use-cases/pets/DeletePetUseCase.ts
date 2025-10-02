import { PetRepository } from '../../../domain/repositories/PetRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class DeletePetUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(petId: string): Promise<void> {
    try {
      const existingPet = await this.petRepository.findById(petId);
      if (!existingPet) {
        throw new NotFoundError(
          `Pet with ID ${petId} not found`,
          undefined,
          'DeletePetUseCase'
        );
      }

      await this.petRepository.delete(petId);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Delete pet') as never;
    }
  }
}
