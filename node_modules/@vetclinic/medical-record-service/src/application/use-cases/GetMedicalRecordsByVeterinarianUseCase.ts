import { ErrorHandler } from "@vetclinic/shared-kernel";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";

export class GetMedicalRecordsByVeterinarianUseCase {
  constructor(private medicalRecordRepository: MedicalRecordRepository) {}

  async execute(veterinarianId: string, page: number = 1, limit: number = 50): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      
      const result = await this.medicalRecordRepository.findAllWithPagination(
        skip, 
        limit, 
        { veterinarianId }
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
      ErrorHandler.handleAppError(error, 'Get medical records by veterinarian');
    }
  }
}
