import { ErrorHandler } from "@vetclinic/shared-kernel";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";

export class GetMedicalRecordsByPatientUseCase {
  constructor(private medicalRecordRepository: MedicalRecordRepository) {}

  async execute(patientId: string, page: number = 1, limit: number = 50): Promise<any> {
    try {
      const skip = (page - 1) * limit;
      const result = await this.medicalRecordRepository.findAll(skip, limit, { patientId });
      
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
      ErrorHandler.handleAppError(error, 'Get medical records by patient');
    }
  }
}
