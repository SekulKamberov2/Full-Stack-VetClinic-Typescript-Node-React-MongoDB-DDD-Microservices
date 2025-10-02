import { Award } from '../../../domain/entities/Award';
import { AwardRepository } from '../../../domain/repositories/AwardRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetAllAwardsUseCase {
  constructor(private awardRepository: AwardRepository) {}

  async execute(): Promise<Award[]> {
    try {
      return await this.awardRepository.findAll();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get all awards') as never;
    }
  }
}
