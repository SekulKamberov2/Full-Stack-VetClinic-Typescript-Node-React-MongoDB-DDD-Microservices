import { Award } from '../../../domain/entities/Award';
import { AwardRepository } from '../../../domain/repositories/AwardRepository';
import { NotFoundError, ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class UpdateAwardUseCase {
  constructor(private awardRepository: AwardRepository) {}

  async execute(awardId: string, updateData: {
    title?: string;
    description?: string;
    points?: number;
    criteria?: string;
    expirationDate?: Date;
  }): Promise<Award> {
    try {
      const existingAward = await this.awardRepository.findById(awardId);
      if (!existingAward) {
        throw new NotFoundError(
          `Award with ID ${awardId} not found`,
          undefined,
          'UpdateAwardUseCase'
        );
      }

      this.validateUpdateData(updateData);

      const updatedAward = existingAward.update(updateData);
      await this.awardRepository.save(updatedAward);

      return updatedAward;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Update award') as never;
    }
  }

  private validateUpdateData(updateData: any): void {
    const context = 'UpdateAwardUseCase';

    if (updateData.points !== undefined && updateData.points < 0) {
      throw new ValidationError("Points must be non-negative", undefined, context);
    }

    if (updateData.expirationDate && updateData.expirationDate <= new Date()) {
      throw new ValidationError("Expiration date must be in the future", undefined, context);
    }
  }
}