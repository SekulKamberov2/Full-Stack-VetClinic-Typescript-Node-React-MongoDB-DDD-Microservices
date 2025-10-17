import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class DeleteVisitUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(id: string): Promise<void> {
    try {
      const existingVisit = await this.visitRepository.findById(id);
      if (!existingVisit) {
        throw new NotFoundError(
          `Visit with ID ${id} not found`,
          undefined,
          'DeleteVisitUseCase'
        );
      }

      await this.visitRepository.delete(id);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Delete visit') as never;
    }
  }
}
