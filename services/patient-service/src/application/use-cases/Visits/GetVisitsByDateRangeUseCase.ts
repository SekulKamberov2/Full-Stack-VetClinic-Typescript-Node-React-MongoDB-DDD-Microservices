import { Visit } from '../../../domain/entities/Visit';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class GetVisitsByDateRangeUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(startDate: Date, endDate: Date): Promise<Visit[]> {
    try {
      if (!startDate || !endDate) {
        throw new ValidationError("Start date and end date are required", undefined, 'GetVisitsByDateRangeUseCase');
      }

      if (startDate > endDate) {
        throw new ValidationError("Start date cannot be after end date", undefined, 'GetVisitsByDateRangeUseCase');
      }

      const maxDays = 365;
      const diffTime = Math.abs(endDate.getTime() - startDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      if (diffDays > maxDays) {
        throw new ValidationError(
          `Date range cannot exceed ${maxDays} days`,
          undefined,
          'GetVisitsByDateRangeUseCase'
        );
      }

      return await this.visitRepository.findByDateRange(startDate, endDate);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get visits by date range') as never;
    }
  }
}
