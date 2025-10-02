
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";
import { Award } from "src/domain/entities/Award";
import { AwardRepository } from "src/domain/repositories/AwardRepository";

export class RevokeAwardUseCase {
  constructor(private awardRepository: AwardRepository) {}

  async execute(awardId: string): Promise<Award> {
    try {
      const existingAward = await this.awardRepository.findById(awardId);
      if (!existingAward) {
        throw new NotFoundError(
          `Award with ID ${awardId} not found`,
          undefined,
          'RevokeAwardUseCase'
        );
      }

      const revokedAward = existingAward.revoke();
      await this.awardRepository.save(revokedAward);

      return revokedAward;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Revoke award') as never;
    }
  }
}
