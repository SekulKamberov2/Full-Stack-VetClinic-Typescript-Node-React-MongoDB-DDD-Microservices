import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export interface VisitStats {
  totalVisits: number;
  visitsByStatus: Record<string, number>;
  visitsByType: Record<string, number>;
  upcomingVisits: number;
  overdueVisits: number;
}

export class GetVisitStatsUseCase {
  constructor(private visitRepository: VisitRepository) {}

  async execute(): Promise<VisitStats> {
    try {
      const stats = await this.visitRepository.getVisitStats();
      const upcomingVisits = (await this.visitRepository.findUpcomingVisits(7)).length;
      const overdueVisits = (await this.visitRepository.findOverdueVisits()).length;

      return {
        ...stats,
        upcomingVisits,
        overdueVisits
      };
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get visit stats') as never;
    }
  }
}
