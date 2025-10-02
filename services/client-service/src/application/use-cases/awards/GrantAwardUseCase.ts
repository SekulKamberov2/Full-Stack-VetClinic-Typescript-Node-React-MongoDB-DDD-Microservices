import { Award, AwardCategory, AwardLevel } from '../../../domain/entities/Award';
import { AwardRepository } from '../../../domain/repositories/AwardRepository';
import { PetRepository } from '../../../domain/repositories/PetRepository';
import { ClientRepository } from '../../../domain/repositories/ClientRepository';
import { ValidationError, NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GrantAwardUseCase {
  constructor(
    private awardRepository: AwardRepository,
    private petRepository: PetRepository,
    private clientRepository: ClientRepository
  ) {}

  async execute(awardData: {
    title: string;
    description: string;
    category: string;
    level: string;
    points: number;
    criteria: string;
    petId: string;
    clientId: string;
    awardedBy: string;
    expirationDate?: Date;
  }): Promise<Award> {
    try {
      this.validateAwardData(awardData);

      const pet = await this.petRepository.findById(awardData.petId);
      if (!pet) {
        throw new NotFoundError(
          `Pet with ID ${awardData.petId} not found`,
          undefined,
          'GrantAwardUseCase'
        );
      }

      const client = await this.clientRepository.findById(awardData.clientId);
      if (!client) {
        throw new NotFoundError(
          `Client with ID ${awardData.clientId} not found`,
          undefined,
          'GrantAwardUseCase'
        );
      }

      const completeAwardData = {
        ...awardData,
        category: awardData.category as AwardCategory,
        level: awardData.level as AwardLevel,
        dateAwarded: new Date(),
        isValid: true,
        imageUrl: undefined,
        metadata: undefined
      };

      const award = Award.create(completeAwardData);
      const savedAward = await this.awardRepository.save(award);

      return savedAward;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Grant award') as never;
    }
  }

  private validateAwardData(awardData: any): void {
    const context = 'GrantAwardUseCase';

    if (!awardData.title || awardData.title.trim() === '') {
      throw new ValidationError("Award title is required", undefined, context);
    }

    if (!awardData.description || awardData.description.trim() === '') {
      throw new ValidationError("Award description is required", undefined, context);
    }

    if (awardData.points < 0) {
      throw new ValidationError("Points must be non-negative", undefined, context);
    }

    if (!awardData.criteria || awardData.criteria.trim() === '') {
      throw new ValidationError("Award criteria is required", undefined, context);
    }

    if (!awardData.awardedBy || awardData.awardedBy.trim() === '') {
      throw new ValidationError("Awarded by field is required", undefined, context);
    }

    const validCategories = Object.values(AwardCategory);
    if (!validCategories.includes(awardData.category as AwardCategory)) {
      throw new ValidationError(`Invalid award category. Must be one of: ${validCategories.join(', ')}`, undefined, context);
    }

    const validLevels = Object.values(AwardLevel);
    if (!validLevels.includes(awardData.level as AwardLevel)) {
      throw new ValidationError(`Invalid award level. Must be one of: ${validLevels.join(', ')}`, undefined, context);
    }
  }
}
