import { AllergyRepository } from '../../../domain/repositories/AllergyRepository';
import { NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class DeleteAllergyUseCase {
  constructor(private allergyRepository: AllergyRepository) {}

  async execute(id: string): Promise<void> {
    try {
      const existingAllergy = await this.allergyRepository.findById(id);
      if (!existingAllergy) {
        throw new NotFoundError(
          `Allergy with ID ${id} not found`,
          undefined,
          'DeleteAllergyUseCase'
        );
      }

      await this.allergyRepository.delete(id);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Delete allergy') as never;
    }
  }
}
