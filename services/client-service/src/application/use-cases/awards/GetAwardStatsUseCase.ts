import { AwardRepository } from '../../../domain/repositories/AwardRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetAwardStatsUseCase {
  constructor(private awardRepository: AwardRepository) {}

  async execute(): Promise<{
    totalAwards: number;
    awardsByCategory: Record<string, number>;
    awardsByLevel: Record<string, number>;
    totalPointsAwarded: number;
  }> {
    try {
      return await this.awardRepository.getAwardStats();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get award stats') as never;
    }
  }
}