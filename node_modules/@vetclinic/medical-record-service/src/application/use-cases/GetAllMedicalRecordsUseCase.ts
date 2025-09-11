import { ErrorHandler } from "@vetclinic/shared-kernel";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";

interface GetAllRecordsFilters {
  patientId?: string;
  clientId?: string;
  veterinarianId?: string;
  dateFrom?: Date;
  dateTo?: Date;
}

export class GetAllMedicalRecordsUseCase {
  constructor(private medicalRecordRepository: MedicalRecordRepository) {}

  async execute(options: {
    page: number;
    limit: number;
    filters?: GetAllRecordsFilters;
  }): Promise<any> {
    try {
      const skip = (options.page - 1) * options.limit;
      const result = await this.medicalRecordRepository.findAllWithPagination(
        skip, 
        options.limit, 
        options.filters
      );
      
      return {
        records: result.records,
        pagination: {
          page: options.page,
          limit: options.limit,
          total: result.totalCount,
          pages: Math.ceil(result.totalCount / options.limit)
        },
        filters: options.filters
      };
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Get all medical records');
    } 
    
  }
}
