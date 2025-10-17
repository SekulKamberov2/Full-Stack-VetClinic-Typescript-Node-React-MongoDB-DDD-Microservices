import { Visit } from '../../../domain/entities/Visit';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetVisitUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(id: string): Promise<Visit | null> {
    try {
      return await this.visitRepository.findById(id);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get visit') as never;
    }
  }
}
