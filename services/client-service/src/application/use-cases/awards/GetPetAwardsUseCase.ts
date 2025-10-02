import { Award } from '../../../domain/entities/Award';
import { AwardRepository } from '../../../domain/repositories/AwardRepository';
import { PetRepository } from '../../../domain/repositories/PetRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetPetAwardsUseCase {
  constructor(
    private awardRepository: AwardRepository,
    private petRepository: PetRepository
  ) {}

  async execute(petId: string): Promise<Award[]> {
    try { 
      const pet = await this.petRepository.findById(petId);
      if (!pet) {
        throw new NotFoundError(
          `Pet with ID ${petId} not found`,
          undefined,
          'GetPetAwardsUseCase'
        );
      }

      const awards = await this.awardRepository.findByPetId(petId);
      
      return awards;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get pet awards') as never;
    }
  }
}
