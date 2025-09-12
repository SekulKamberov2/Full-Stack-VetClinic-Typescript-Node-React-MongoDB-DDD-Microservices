import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ValidationError, NotFoundError, DuplicateError, ErrorHandler } from "@vetclinic/shared-kernel";

export class UpdateClientUseCase {
  constructor(private clientRepository: ClientRepository) {}

  async execute(id: string, clientData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }>): Promise<Client> {
    try {
      this.validateClientData(clientData);
      
      const existingClient = await this.clientRepository.findById(id);
      if (!existingClient) {
        throw new NotFoundError(
          `Client with ID ${id} not found`,
          undefined,
          'UpdateClientUseCase'
        );
      }

      if (clientData.email && clientData.email !== existingClient.email) {
        const clientWithEmail = await this.clientRepository.findByEmail(clientData.email);
        if (clientWithEmail) {
          throw new DuplicateError(
            `Client with email ${clientData.email} already exists`,
            undefined,
            'UpdateClientUseCase',
            'email'
          );
        }
      }

      const updatedClient = existingClient.update(clientData);
      await this.clientRepository.update(updatedClient);
      return updatedClient;
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Update client') as never;
    }
  }

  private validateClientData(clientData: Partial<{
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
  }>): void {
    const context = 'UpdateClientUseCase';

    if (clientData.firstName !== undefined && (!clientData.firstName || clientData.firstName.trim() === '')) {
      throw new ValidationError("First name cannot be empty", undefined, context);
    }

    if (clientData.lastName !== undefined && (!clientData.lastName || clientData.lastName.trim() === '')) {
      throw new ValidationError("Last name cannot be empty", undefined, context);
    }

    if (clientData.email !== undefined) {
      if (!clientData.email || clientData.email.trim() === '') {
        throw new ValidationError("Email cannot be empty", undefined, context);
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(clientData.email)) {
        throw new ValidationError("Invalid email format", undefined, context);
      }
    }

    if (clientData.phone !== undefined) {
      if (!clientData.phone || clientData.phone.trim() === '') {
        throw new ValidationError("Phone number cannot be empty", undefined, context);
      }

      const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
      if (!phoneRegex.test(clientData.phone.replace(/[\s\-\(\)]/g, ''))) {
        throw new ValidationError("Invalid phone number format", undefined, context);
      }
    }

    if (clientData.address) {
      this.validateAddress(clientData.address, context);
    }
  }

  private validateAddress(address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }, context: string): void {
    if (address.street !== undefined && (!address.street || address.street.trim() === '')) {
      throw new ValidationError("Street address cannot be empty", undefined, context);
    }

    if (address.city !== undefined && (!address.city || address.city.trim() === '')) {
      throw new ValidationError("City cannot be empty", undefined, context);
    }

    if (address.state !== undefined && (!address.state || address.state.trim() === '')) {
      throw new ValidationError("State cannot be empty", undefined, context);
    }

    if (address.zipCode !== undefined && (!address.zipCode || address.zipCode.trim() === '')) {
      throw new ValidationError("Zip code cannot be empty", undefined, context);
    }

    if (address.country !== undefined && (!address.country || address.country.trim() === '')) {
      throw new ValidationError("Country cannot be empty", undefined, context);
    }

    if (address.zipCode !== undefined) {
      const zipCodeRegex = /^\d{5}(-\d{4})?$/;
      if (!zipCodeRegex.test(address.zipCode)) {
        throw new ValidationError("Invalid zip code format", undefined, context);
      } 
    }
  }
}
