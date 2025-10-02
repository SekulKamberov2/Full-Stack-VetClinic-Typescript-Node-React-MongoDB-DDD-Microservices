import { Pet } from '../../../domain/entities/Pet';
import { PetRepository } from '../../../domain/repositories/PetRepository';
import { NotFoundError, ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class UpdatePetProfileImageUseCase {
  constructor(private petRepository: PetRepository) {}

  async execute(petId: string, profileImage: string): Promise<Pet> {
    try {
      if (!profileImage || profileImage.trim() === '') {
        throw new ValidationError("Profile image data cannot be empty", undefined, 'UpdatePetProfileImageUseCase');
      }

      if (!this.isValidImageData(profileImage)) {
        throw new ValidationError("Invalid image data format", undefined, 'UpdatePetProfileImageUseCase');
      }

      const existingPet = await this.petRepository.findById(petId);
      if (!existingPet) {
        throw new NotFoundError(
          `Pet with ID ${petId} not found`,
          undefined,
          'UpdatePetProfileImageUseCase'
        );
      }

      const updatedPet = existingPet.updateProfileImage(profileImage);
      await this.petRepository.save(updatedPet);

      return updatedPet;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Update pet profile image') as never;
    }
  }

  private isValidImageData(imageData: string): boolean {
    if (imageData.startsWith('http://') || imageData.startsWith('https://')) {
      return true;
    }

    if (imageData.startsWith('data:image/')) {
      return true;
    }

    return false;
  }
}
