import { AppError, ErrorHandler, NotFoundError, ValidationError } from "@vetclinic/shared-kernel";
import { MedicalRecord } from "../../domain/entities/MedicalRecord";
import { MedicalRecordRepository } from "../../domain/repositories/MedicalRecordRepository";

export interface GetMedicalRecordByIdRequest {
  recordId: string; 
  requestingUserId?: string;
  requestingUserRole?: string;
}

export class GetMedicalRecordByIdUseCase {
  constructor(private medicalRecordRepository: MedicalRecordRepository) {}

  async execute(request: GetMedicalRecordByIdRequest): Promise<MedicalRecord> {
    try {
      this.validateRequest(request);

      const record = await this.medicalRecordRepository.findById(request.recordId);
      
      if (!record) {
        throw new NotFoundError(`Medical record with ID ${request.recordId} not found`);
      }
  
      this.checkAuthorization(record, request);

      return record;
    } catch (error) {
      ErrorHandler.handleAppError(error, 'Get medical record by ID');
    }
  }

  private validateRequest(request: GetMedicalRecordByIdRequest): void {
    if (!request.recordId || request.recordId.trim() === '') {
      throw new ValidationError("Medical record ID is required");
    }

    if (request.recordId.length < 3) {
      throw new ValidationError("Medical record ID appears to be invalid");
    }
  }

  private checkAuthorization(_record: MedicalRecord, request: GetMedicalRecordByIdRequest): void { 
    if (!request.requestingUserId || !request.requestingUserRole) {
       return;
    } 

    throw new AppError("Unauthorized: Insufficient permissions to access this medical record", 'UNAUTHORIZED');
  }
}
