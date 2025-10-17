import { Patient } from '../../../domain/entities/Patient';
import { PatientRepository } from '../../../domain/repositories/PatientRepository';
import { ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class SearchPatientsUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(query: string, ownerId?: string): Promise<Patient[]> {
    try {
      this.validateSearchParameters(query, ownerId);

      if (query.length < 2) {
        throw new ValidationError(
          "Search query must be at least 2 characters long",
          undefined,
          'SearchPatientsUseCase'
        );
      }

      const sanitizedQuery = query.length > 100 ? query.substring(0, 100) : query;

      return await this.patientRepository.search(sanitizedQuery, ownerId);
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Search patients') as never;
    }
  }

  private validateSearchParameters(query: string, ownerId?: string): void {
    const context = 'SearchPatientsUseCase';

    if (!query || query.trim() === '') {
      throw new ValidationError("Search query is required", undefined, context);
    }

    const trimmedQuery = query.trim();
    if (trimmedQuery === '') {
      throw new ValidationError("Search query cannot be only whitespace", undefined, context);
    }

    const harmfulPatterns = [
      /[{}[\]$*+?\\^|]/g, // special characters
      /<script>/i,        // script tags
      /SELECT|INSERT|UPDATE|DELETE|DROP/i // SQL injection patterns
    ];

    for (const pattern of harmfulPatterns) {
      if (pattern.test(query)) {
        throw new ValidationError(
          "Search query contains invalid characters",
          undefined,
          context
        );
      }
    }

    if (ownerId && ownerId.trim() !== '') {
      if (ownerId.length > 50) {
        throw new ValidationError("Owner ID is too long", undefined, context);
      }

      const mongoIdRegex = /^[0-9a-fA-F]{24}$/;
      if (!mongoIdRegex.test(ownerId)) {
        throw new ValidationError("Invalid owner ID format", undefined, context);
      }
    }
  }
}
