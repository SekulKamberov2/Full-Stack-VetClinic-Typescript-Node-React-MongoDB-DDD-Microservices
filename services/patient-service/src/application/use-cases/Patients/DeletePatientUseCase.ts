import { PatientRepository } from '../../../domain/repositories/PatientRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class DeletePatientUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(id: string): Promise<void> {
    try {
      const existingPatient = await this.patientRepository.findById(id);
      if (!existingPatient) {
        throw new NotFoundError(
          `Patient with ID ${id} not found`,
          undefined,
          'DeletePatientUseCase'
        );
      }

      await this.patientRepository.delete(id);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Delete patient') as never;
    }
  }
}
