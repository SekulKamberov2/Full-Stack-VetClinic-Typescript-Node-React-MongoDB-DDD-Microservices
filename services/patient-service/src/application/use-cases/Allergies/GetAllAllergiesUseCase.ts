import { Allergy } from '../../../domain/entities/Allergy';
import { AllergyRepository } from '../../../domain/repositories/AllergyRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export class GetAllAllergiesUseCase {
  constructor(private allergyRepository: AllergyRepository) {}

  async execute(): Promise<Allergy[]> {
    try {
      return await this.allergyRepository.findAll();
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get all allergies') as never;
    }
  }
}
