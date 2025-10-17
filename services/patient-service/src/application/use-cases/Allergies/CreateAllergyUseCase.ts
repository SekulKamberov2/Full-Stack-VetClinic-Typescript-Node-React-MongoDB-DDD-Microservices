import { Allergy, AllergyProps, AllergySeverity } from '../../../domain/entities/Allergy';
import { AllergyRepository } from '../../../domain/repositories/AllergyRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class CreateAllergyUseCase {
  constructor(private allergyRepository: AllergyRepository) {}

  async execute(allergyData: Omit<AllergyProps, 'id' | 'createdAt' | 'updatedAt'>): Promise<Allergy> {
    try {
      const processedData = this.processAllergyData(allergyData);
      this.validateAllergyData(processedData);

      const allergy = Allergy.create({
        ...processedData,
        isActive: processedData.isActive ?? true
      });

      return await this.allergyRepository.save(allergy);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Create allergy') as never;
    }
  }

  private processAllergyData(allergyData: any): any {
    const processed = { ...allergyData };
    
    if (allergyData.firstObserved) {
      processed.firstObserved = new Date(allergyData.firstObserved);
    }
    
    return processed;
  }

  private validateAllergyData(allergyData: any): void {
    const context = 'CreateAllergyUseCase';

    if (!allergyData.patientId || allergyData.patientId.trim() === '') {
      throw new ValidationError("Patient ID is required", undefined, context);
    }

    if (!allergyData.allergen || allergyData.allergen.trim() === '') {
      throw new ValidationError("Allergen is required", undefined, context);
    }

    if (allergyData.allergen.length > 200) {
      throw new ValidationError("Allergen cannot exceed 200 characters", undefined, context);
    }

    if (!allergyData.reaction || allergyData.reaction.trim() === '') {
      throw new ValidationError("Reaction description is required", undefined, context);
    }

    if (allergyData.reaction.length > 500) {
      throw new ValidationError("Reaction description cannot exceed 500 characters", undefined, context);
    }

    if (!allergyData.severity) {
      throw new ValidationError("Severity is required", undefined, context);
    }

    const validSeverities = Object.values(AllergySeverity);
    if (!validSeverities.includes(allergyData.severity)) {
      throw new ValidationError(
        `Invalid severity. Must be one of: ${validSeverities.join(', ')}`,
        undefined,
        context
      );
    }

    if (!allergyData.firstObserved) {
      throw new ValidationError("First observed date is required", undefined, context);
    }

    if (!(allergyData.firstObserved instanceof Date)) {
      throw new ValidationError("First observed date must be a valid date", undefined, context);
    }

    if (allergyData.firstObserved > new Date()) {
      throw new ValidationError("First observed date cannot be in the future", undefined, context);
    }

    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 50);
    if (allergyData.firstObserved < minDate) {
      throw new ValidationError("First observed date cannot be more than 50 years ago", undefined, context);
    }

    if (allergyData.notes && allergyData.notes.length > 1000) {
      throw new ValidationError("Notes cannot exceed 1000 characters", undefined, context);
    }

    const harmfulPatterns = [
      /<script>/i,
      /SELECT|INSERT|UPDATE|DELETE|DROP/i
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(allergyData.allergen) || pattern.test(allergyData.reaction)) {
        throw new ValidationError(
          "Allergen or reaction contains invalid characters",
          undefined,
          context
        );
      }
    }
  }
}
