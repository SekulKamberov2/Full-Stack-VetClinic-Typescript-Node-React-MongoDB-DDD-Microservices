import { Award } from '../../../domain/entities/Award';
import { AwardRepository } from '../../../domain/repositories/AwardRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetAwardUseCase {
  constructor(private awardRepository: AwardRepository) {}

  async execute(awardId: string): Promise<Award> {
    try {
      const award = await this.awardRepository.findById(awardId);
      if (!award) {
        throw new NotFoundError(
          `Award with ID ${awardId} not found`,
          undefined,
          'GetAwardUseCase'
        );
      }
      return award;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get award') as never;
    }
  }
}