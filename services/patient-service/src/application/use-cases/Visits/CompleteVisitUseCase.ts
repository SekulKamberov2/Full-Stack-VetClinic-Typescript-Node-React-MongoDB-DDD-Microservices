import { ErrorHandler, NotFoundError } from "@vetclinic/shared-kernel";
import { Visit } from "src/domain/entities/Visit";
import { VisitRepository } from "src/domain/repositories/VisitRepository";

export class CompleteVisitUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(id: string): Promise<Visit> {
    try {
      const existingVisit = await this.visitRepository.findById(id);
      if (!existingVisit) {
        throw new NotFoundError(
          `Visit with ID ${id} not found`,
          undefined,
          'CompleteVisitUseCase'
        );
      }

      const completedVisit = existingVisit.complete();
      await this.visitRepository.update(completedVisit);
      return completedVisit;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Complete visit') as never;
    }
  }
}
