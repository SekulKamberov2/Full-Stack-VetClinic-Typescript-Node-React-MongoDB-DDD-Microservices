import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { NotFoundError, ValidationError, ErrorHandler } from "@vetclinic/shared-kernel";

export class UpdateClientProfileImageUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(clientId: string, profileImage: string): Promise<Client> {
    try {
      if (!profileImage || profileImage.trim() === '') {
        throw new ValidationError("Profile image data cannot be empty", undefined, 'UpdateClientProfileImageUseCase');
      }

      if (!this.isValidImageData(profileImage)) {
        throw new ValidationError("Invalid image data format", undefined, 'UpdateClientProfileImageUseCase');
      }

      const existingClient = await this.clientRepository.findById(clientId);
      if (!existingClient) {
        throw new NotFoundError(
          `Client with ID ${clientId} not found`,
          undefined,
          'UpdateClientProfileImageUseCase'
        );
      }

      const updatedClient = existingClient.updateProfileImage(profileImage);
      await this.clientRepository.update(updatedClient);

      return updatedClient;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Update client profile image') as never;
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