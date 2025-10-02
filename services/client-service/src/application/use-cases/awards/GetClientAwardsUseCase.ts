import { Award } from '../../../domain/entities/Award';
import { AwardRepository } from '../../../domain/repositories/AwardRepository';
import { ClientRepository } from '../../../domain/repositories/ClientRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetClientAwardsUseCase {
  constructor(
    private awardRepository: AwardRepository,
    private clientRepository: ClientRepository
  ) {}

  async execute(clientId: string): Promise<Award[]> {
    try {
      const client = await this.clientRepository.findById(clientId);
      if (!client) {
        throw new NotFoundError(
          `Client with ID ${clientId} not found`,
          undefined,
          'GetClientAwardsUseCase'
        );
      }

      return await this.awardRepository.findByClientId(clientId);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get client awards') as never;
    }
  }
}
