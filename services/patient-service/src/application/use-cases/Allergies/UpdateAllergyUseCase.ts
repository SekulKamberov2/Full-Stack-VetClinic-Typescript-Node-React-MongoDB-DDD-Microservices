import { Allergy, AllergySeverity } from '../../../domain/entities/Allergy';
import { AllergyRepository } from '../../../domain/repositories/AllergyRepository';
import { ValidationError, NotFoundError, ErrorHandler } from "@vetclinic/shared-kernel";

export class UpdateAllergyUseCase {
  constructor(private allergyRepository: AllergyRepository) {}

  async execute(id: string, allergyData: Partial<{
    allergen: string;
    reaction: string;
    severity: AllergySeverity;
    firstObserved: Date;
    isActive: boolean;
    notes?: string;
  }>): Promise<Allergy> {
    try {
      this.validateAllergyData(allergyData);
      
      const existingAllergy = await this.allergyRepository.findById(id);
      if (!existingAllergy) {
        throw new NotFoundError(
          `Allergy with ID ${id} not found`,
          undefined,
          'UpdateAllergyUseCase'
        );
      }

      const updatedAllergy = existingAllergy.update(allergyData);
      await this.allergyRepository.update(updatedAllergy);
      return updatedAllergy;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Update allergy') as never;
    }
  }

  private validateAllergyData(allergyData: any): void {
    const context = 'UpdateAllergyUseCase';

    if (allergyData.allergen !== undefined && (!allergyData.allergen || allergyData.allergen.trim() === '')) {
      throw new ValidationError("Allergen cannot be empty", undefined, context);
    }

    if (allergyData.reaction !== undefined && (!allergyData.reaction || allergyData.reaction.trim() === '')) {
      throw new ValidationError("Reaction description cannot be empty", undefined, context);
    }

    if (allergyData.severity !== undefined) {
      const validSeverities = Object.values(AllergySeverity); 
      if (!validSeverities.includes(allergyData.severity)) {
        throw new ValidationError(`Invalid severity. Must be one of: ${validSeverities.join(', ')}`, undefined, context);
      }
    }

    if (allergyData.firstObserved !== undefined && !(allergyData.firstObserved instanceof Date)) {
      throw new ValidationError("First observed date must be a valid date", undefined, context);
    }

    if (allergyData.firstObserved !== undefined && allergyData.firstObserved > new Date()) {
      throw new ValidationError("First observed date cannot be in the future", undefined, context);
    }
  }
}
