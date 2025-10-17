import { VaccinationRecordRepository } from '../../../domain/repositories/VaccinationRecordRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export interface VaccinationStats {
  totalVaccinations: number;
  dueVaccinations: number;
  overdueVaccinations: number;
  vaccinationsByType: Record<string, number>;
  upcomingDueVaccinations: number;
}

export class GetVaccinationStatsUseCase {
  constructor(private vaccinationRepository: VaccinationRecordRepository) {}

  async execute(): Promise<VaccinationStats> {
    try {
      const stats = await this.vaccinationRepository.getVaccinationStats();
       
      const dueVaccinations = await this.vaccinationRepository.findDueVaccinations();
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
      
      const upcomingDueVaccinations = dueVaccinations.filter(vaccination => 
        vaccination.nextDueDate <= thirtyDaysFromNow
      ).length;

      const allVaccinations = await this.vaccinationRepository.findAll();
      const vaccinationsByType: Record<string, number> = {};
      
      allVaccinations.forEach(vaccination => {
        const vaccineName = vaccination.vaccineName;
        vaccinationsByType[vaccineName] = (vaccinationsByType[vaccineName] || 0) + 1;
      });

      return {
        ...stats,
        upcomingDueVaccinations,
        vaccinationsByType
      };
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get vaccination stats') as never;
    }
  }
}
