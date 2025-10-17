import { Visit, VisitStatus } from '../../../domain/entities/Visit';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { ValidationError, NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class UpdateVisitUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(id: string, visitData: Partial<{
    scheduledDateTime: Date;
    actualDateTime?: Date;
    status: VisitStatus;
    type: string;
    chiefComplaint: string;
    assignedVeterinarianId: string;
    notes?: string;
    diagnosis?: string;
    treatment?: string;
  }>): Promise<Visit> {
    try {
      this.validateVisitData(visitData);
      
      const existingVisit = await this.visitRepository.findById(id);
      if (!existingVisit) {
        throw new NotFoundError(
          `Visit with ID ${id} not found`,
          undefined,
          'UpdateVisitUseCase'
        );
      }

      const updatedVisit = existingVisit.update(visitData);
      await this.visitRepository.update(updatedVisit);
      return updatedVisit;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Update visit') as never;
    }
  }

  private validateVisitData(visitData: any): void {
    const context = 'UpdateVisitUseCase';

    if (visitData.scheduledDateTime !== undefined && !(visitData.scheduledDateTime instanceof Date)) {
      throw new ValidationError("Scheduled date time must be a valid date", undefined, context);
    }

    if (visitData.actualDateTime !== undefined && !(visitData.actualDateTime instanceof Date)) {
      throw new ValidationError("Actual date time must be a valid date", undefined, context);
    }

    if (visitData.status !== undefined) {
      const validStatuses = ['scheduled', 'checked_in', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(visitData.status)) {
        throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, undefined, context);
      }
    }

    if (visitData.type !== undefined && (!visitData.type || visitData.type.trim() === '')) {
      throw new ValidationError("Visit type cannot be empty", undefined, context);
    }

    if (visitData.chiefComplaint !== undefined && (!visitData.chiefComplaint || visitData.chiefComplaint.trim() === '')) {
      throw new ValidationError("Chief complaint cannot be empty", undefined, context);
    }

    if (visitData.assignedVeterinarianId !== undefined && (!visitData.assignedVeterinarianId || visitData.assignedVeterinarianId.trim() === '')) {
      throw new ValidationError("Veterinarian ID cannot be empty", undefined, context);
    }
  }
}
