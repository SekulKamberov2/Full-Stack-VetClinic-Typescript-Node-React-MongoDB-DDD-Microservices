import { Visit, VisitProps, VisitStatus } from '../../../domain/entities/Visit';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { ValidationError, ErrorHandler } from '@vetclinic/shared-kernel';

export class CreateVisitUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(
    visitData: Omit<VisitProps, 'id' | 'createdAt' | 'updatedAt'>
  ): Promise<Visit> {
    try {
      const processedData = this.processVisitData(visitData);
      this.validateVisitData(processedData);

      const visit = Visit.create({
        ...processedData,
        status: processedData.status || VisitStatus.SCHEDULED,
      });

      return await this.visitRepository.save(visit);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'CreateVisitUseCase') as never;
    }
  }

  private processVisitData(visitData: any): any {
    const processed = { ...visitData };
    
    if (visitData.scheduledDateTime) {
      processed.scheduledDateTime = new Date(visitData.scheduledDateTime);
    }
    
    if (visitData.actualDateTime) {
      processed.actualDateTime = new Date(visitData.actualDateTime);
    }
    
    if (visitData.checkinTime) {
      processed.checkinTime = new Date(visitData.checkinTime);
    }
    
    if (visitData.checkoutTime) {
      processed.checkoutTime = new Date(visitData.checkoutTime);
    }
    
    return processed;
  }

  private validateVisitData(visitData: any): void {
    const context = 'CreateVisitUseCase';

    if (!visitData.patientId || visitData.patientId.trim() === '') {
      throw new ValidationError('Patient ID is required', undefined, context);
    }

    if (
      !visitData.assignedVeterinarianId ||
      visitData.assignedVeterinarianId.trim() === ''
    ) {
      throw new ValidationError('Veterinarian ID is required', undefined, context);
    }

    if (!visitData.type || visitData.type.trim() === '') {
      throw new ValidationError('Visit type is required', undefined, context);
    }

    if (!visitData.chiefComplaint || visitData.chiefComplaint.trim() === '') {
      throw new ValidationError('Chief complaint is required', undefined, context);
    }

    if (!visitData.scheduledDateTime) {
      throw new ValidationError('Scheduled date time is required', undefined, context);
    }

    if (!(visitData.scheduledDateTime instanceof Date)) {
      throw new ValidationError('Scheduled date time must be a valid date', undefined, context);
    }

    if (visitData.scheduledDateTime < new Date()) {
      throw new ValidationError('Scheduled date time cannot be in the past', undefined, context);
    }

    if (visitData.status) {
      const validStatuses: VisitStatus[] = [
        VisitStatus.SCHEDULED,
        VisitStatus.CHECKED_IN,
        VisitStatus.IN_PROGRESS,
        VisitStatus.COMPLETED,
        VisitStatus.CANCELLED,
      ];

      if (!validStatuses.includes(visitData.status)) {
        throw new ValidationError(
          `Invalid status. Must be one of: ${validStatuses.join(', ')}`,
          undefined,
          context
        );
      }
    }
  }
}
