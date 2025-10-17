import { Allergy } from '../../../domain/entities/Allergy';
import { AllergyRepository } from '../../../domain/repositories/AllergyRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetAllergyUseCase {
  constructor(private allergyRepository: AllergyRepository) {}

  async execute(id: string): Promise<Allergy | null> {
    try {
      return await this.allergyRepository.findById(id);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get allergy') as never;
    }
  }
}
