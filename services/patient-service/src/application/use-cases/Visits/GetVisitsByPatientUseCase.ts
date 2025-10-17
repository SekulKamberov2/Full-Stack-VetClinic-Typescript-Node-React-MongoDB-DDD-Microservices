import { Visit } from '../../../domain/entities/Visit';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetVisitsByPatientUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(patientId: string): Promise<Visit[]> {
    try {
      if (!patientId || patientId.trim() === '') {
        throw new ValidationError("Patient ID is required", undefined, 'GetVisitsByPatientUseCase');
      }

      return await this.visitRepository.findByPatientId(patientId);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get visits by patient') as never;
    }
  }
}
