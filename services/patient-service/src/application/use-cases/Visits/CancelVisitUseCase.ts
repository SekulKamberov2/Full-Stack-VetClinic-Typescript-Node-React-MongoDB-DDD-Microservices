import { Visit } from '../../../domain/entities/Visit';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { NotFoundError, ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class CancelVisitUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(id: string): Promise<Visit> {
    try {
      const existingVisit = await this.visitRepository.findById(id);
      if (!existingVisit) {
        throw new NotFoundError(
          `Visit with ID ${id} not found`,
          undefined,
          'CancelVisitUseCase'
        );
      }

      if (existingVisit.status === 'completed') {
        throw new ValidationError(
          'Cannot cancel a visit that is already completed',
          undefined,
          'CancelVisitUseCase'
        );
      }

      if (existingVisit.status === 'cancelled') {
        throw new ValidationError(
          'Visit is already cancelled',
          undefined,
          'CancelVisitUseCase'
        );
      }

      const cancelledVisit = existingVisit.cancel();
      await this.visitRepository.update(cancelledVisit);
      return cancelledVisit;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Cancel visit') as never;
    }
  }
}
