import { Visit } from '../../../domain/entities/Visit';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { NotFoundError, ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class CheckInVisitUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(id: string): Promise<Visit> {
    try {
      const existingVisit = await this.visitRepository.findById(id);
      if (!existingVisit) {
        throw new NotFoundError(
          `Visit with ID ${id} not found`,
          undefined,
          'CheckInVisitUseCase'
        );
      }

      if (existingVisit.status !== 'scheduled') {
        throw new ValidationError(
          `Cannot check in a visit with status: ${existingVisit.status}. Visit must be scheduled.`,
          undefined,
          'CheckInVisitUseCase'
        );
      }

      const checkedInVisit = existingVisit.checkIn();
      await this.visitRepository.update(checkedInVisit);
      return checkedInVisit;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Check in visit') as never;
    }
  }
}