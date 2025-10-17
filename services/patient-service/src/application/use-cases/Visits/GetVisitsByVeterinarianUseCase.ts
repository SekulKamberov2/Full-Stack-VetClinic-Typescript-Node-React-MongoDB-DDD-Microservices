import { Visit } from '../../../domain/entities/Visit';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetVisitsByVeterinarianUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(veterinarianId: string): Promise<Visit[]> {
    try {
      if (!veterinarianId || veterinarianId.trim() === '') {
        throw new ValidationError("Veterinarian ID is required", undefined, 'GetVisitsByVeterinarianUseCase');
      }

      return await this.visitRepository.findByVeterinarianId(veterinarianId);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get visits by veterinarian') as never;
    }
  }
}
