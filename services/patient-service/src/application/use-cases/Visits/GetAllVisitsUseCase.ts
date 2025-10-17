import { Visit } from '../../../domain/entities/Visit';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetAllVisitsUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(): Promise<Visit[]> {
    try {
      return await this.visitRepository.findAll();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get all visits') as never;
    }
  }
}
