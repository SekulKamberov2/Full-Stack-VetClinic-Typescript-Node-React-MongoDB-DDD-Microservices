import { Visit } from '../../../domain/entities/Visit';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetVisitsByStatusUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(status: string): Promise<Visit[]> {
    try {
      if (!status || status.trim() === '') {
        throw new ValidationError("Status is required", undefined, 'GetVisitsByStatusUseCase');
      }

      const validStatuses = ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        throw new ValidationError(
          `Invalid status: ${status}. Must be one of: ${validStatuses.join(', ')}`,
          undefined,
          'GetVisitsByStatusUseCase'
        );
      }

      return await this.visitRepository.findByStatus(status);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get visits by status') as never;
    }
  }
}
