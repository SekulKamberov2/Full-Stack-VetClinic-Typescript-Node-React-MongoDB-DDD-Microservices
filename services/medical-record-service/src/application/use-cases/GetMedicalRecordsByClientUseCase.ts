import { ErrorHandler } from "@vetclinic/shared-kernel";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";

export class GetMedicalRecordsByClientUseCase {
  constructor(private medicalRecordRepository: MedicalRecordRepository) {}

  async execute(clientId: string, page: number = 1, limit: number = 50): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const result = await this.medicalRecordRepository.findAllWithPagination(
        skip, 
        limit, 
        { clientId }
      );
      
      return {
        records: result.records,
        pagination: {
          page,
          limit,
          total: result.totalCount,
          pages: Math.ceil(result.totalCount / limit)
        }
      };
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Get medical records by client');
    }
  }
}
