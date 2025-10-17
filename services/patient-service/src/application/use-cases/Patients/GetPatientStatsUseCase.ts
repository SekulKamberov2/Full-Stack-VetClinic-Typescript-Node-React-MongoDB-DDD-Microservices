import { PatientRepository } from '../../../domain/repositories/PatientRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";
import { Patient, PatientStatus } from '../../../domain/entities/Patient';

export interface PatientStats {
  totalPatients: number;
  activePatients: number;
  inactivePatients: number;
  patientsBySpecies: Record<string, number>;
  patientsByStatus: Record<string, number>;
  patientsByGender: Record<string, number>;
  averageAge: number;
  recentPatients: number;
  speciesDistribution: Array<{
    species: string;
    count: number;
    percentage: number;
  }>;
}

export class GetPatientStatsUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(ownerId?: string): Promise<PatientStats> {
    try {
      this.validateOwnerId(ownerId);

      const basicStats = await this.patientRepository.getPatientStats(ownerId);
      
      const allPatients = ownerId 
        ? await this.patientRepository.findByOwnerId(ownerId)
        : await this.patientRepository.findAllIncludingInactive();

      const patientsByStatus = this.calculatePatientsByStatus(allPatients);
      const patientsByGender = this.calculatePatientsByGender(allPatients);
      const averageAge = this.calculateAverageAge(allPatients);
      const recentPatients = this.calculateRecentPatients(allPatients);
      const speciesDistribution = this.calculateSpeciesDistribution(
        basicStats.patientsBySpecies, 
        basicStats.totalPatients
      );

      return {
        totalPatients: basicStats.totalPatients,
        activePatients: basicStats.activePatients,
        inactivePatients: basicStats.totalPatients - basicStats.activePatients,
        patientsBySpecies: basicStats.patientsBySpecies,
        patientsByStatus,
        patientsByGender,
        averageAge,
        recentPatients,
        speciesDistribution
      };
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get patient stats') as never;
    }
  }

  private validateOwnerId(ownerId?: string): void {
    const context = 'GetPatientStatsUseCase';

    if (ownerId && ownerId.trim() !== '') {
      if (ownerId.length > 50) {
        throw new ValidationError("Owner ID is too long", undefined, context);
      }

      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!mongoIdRegex.test(ownerId)) {
        throw new ValidationError("Invalid owner ID format", undefined, context);
      }
    }
  }

  private calculatePatientsByStatus(patients: Patient[]): Record<string, number> {
    const statusCount: Record<string, number> = {
      [PatientStatus.ACTIVE]: 0,
      [PatientStatus.DECEASED]: 0,
      [PatientStatus.TRANSFERRED]: 0,
      'inactive': 0
    };

    patients.forEach(patient => {
      statusCount[patient.status] = (statusCount[patient.status] || 0) + 1;
      
      if (!patient.isActive) {
        statusCount['inactive'] = (statusCount['inactive'] || 0) + 1;
      }
    });

    return statusCount;
  }

  private calculatePatientsByGender(patients: Patient[]): Record<string, number> {
    const genderCount: Record<string, number> = {
      'Male': 0,
      'Female': 0,
      'Unknown': 0
    };

    patients.forEach(patient => {
      const normalizedSex = this.normalizeSex(patient.sex);
      genderCount[normalizedSex] = (genderCount[normalizedSex] || 0) + 1;
    });

    return genderCount;
  }

  private normalizeSex(sex: string): string {
    const lowerSex = sex.toLowerCase().trim();
    
    if (lowerSex.includes('male') && !lowerSex.includes('female')) {
      return 'Male';
    } else if (lowerSex.includes('female')) {
      return 'Female';
    } else {
      return 'Unknown';
    }
  }

  private calculateAverageAge(patients: Patient[]): number {
    const patientsWithValidAge = patients.filter(patient => 
      patient.dateOfBirth && this.isValidDate(patient.dateOfBirth)
    );

    if (patientsWithValidAge.length === 0) return 0;

    const totalAge = patientsWithValidAge.reduce((sum, patient) => {
      const age = this.calculateAgeFromDateOfBirth(patient.dateOfBirth);
      return sum + age;
    }, 0);

    return Math.round((totalAge / patientsWithValidAge.length) * 10) / 10;
  }

  private calculateAgeFromDateOfBirth(dateOfBirth: Date): number {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return Math.max(0, age);
  }

  private calculateRecentPatients(patients: Patient[]): number {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return patients.filter(patient => {
      const createdAt = patient.createdAt;
      return createdAt >= thirtyDaysAgo;
    }).length;
  }

  private calculateSpeciesDistribution(
    patientsBySpecies: Record<string, number>, 
    totalPatients: number
  ): Array<{ species: string; count: number; percentage: number }> {
    if (totalPatients === 0) return [];

    return Object.entries(patientsBySpecies)
      .map(([species, count]) => ({
        species,
        count,
        percentage: Math.round((count / totalPatients) * 1000) / 10
      }))
      .sort((a, b) => b.count - a.count);
  }

  private isValidDate(date: Date): boolean {
    return date instanceof Date && !isNaN(date.getTime());
  }
}
