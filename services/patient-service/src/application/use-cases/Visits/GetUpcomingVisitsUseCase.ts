import { Visit } from '../../../domain/entities/Visit';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetUpcomingVisitsUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(days: number = 7): Promise<Visit[]> {
    try {
      if (days <= 0) {
        throw new ValidationError("Days must be a positive number", undefined, 'GetUpcomingVisitsUseCase');
      }

      if (days > 365) {
        throw new ValidationError("Cannot look up more than 365 days in advance", undefined, 'GetUpcomingVisitsUseCase');
      }

      return await this.visitRepository.findUpcomingVisits(days);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get upcoming visits') as never;
    }
  }
}
