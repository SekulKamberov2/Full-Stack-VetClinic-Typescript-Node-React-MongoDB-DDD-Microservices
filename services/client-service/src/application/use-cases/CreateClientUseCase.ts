import { Client } from '../../domain/entities/Client';
import { ClientRepository } from '../../domain/repositories/ClientRepository';
import { ValidationError, DuplicateError, ErrorHandler } from "@vetclinic/shared-kernel";

export class CreateClientUseCase {
  constructor(
    private clientRepository: ClientRepository
  ) {}

  async execute(clientData: {
    id?: string;
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
  }): Promise<Client> { 
    try {
      this.validateClientData(clientData);
      
      const existingClient = await this.clientRepository.findByEmail(clientData.email);
      if (existingClient) {
        throw new DuplicateError(
          `Client with email ${clientData.email} already exists`,
          undefined,
          'CreateClientUseCase',
          'email'
        );
      }
  
      const clientId = clientData.id;

      const completeClientData = {
        _id: clientId,
        firstName: clientData.firstName,
        lastName: clientData.lastName,
        email: clientData.email,
        phone: clientData.phone,
        address: clientData.address,
        pets: [],
        isActive: true
      };

      console.log('CreateClientUseCase: Creating client with ID:', clientId);

      const client = Client.create(completeClientData);

      const savedClient = await this.clientRepository.save(client);

      console.log('CreateClientUseCase: Client created with ID:', savedClient._id);

      return savedClient;  
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Create client') as never;
    }
  }

  private validateClientData(clientData: {
    id?: string;
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
  }): void {
    const { firstName, lastName, email, phone, address } = clientData;
    const context = 'CreateClientUseCase';

    if (!firstName || firstName.trim() === '') {
      throw new ValidationError("First name is required", undefined, context);
    }

    if (!lastName || lastName.trim() === '') {
      throw new ValidationError("Last name is required", undefined, context);
    }

    if (!email || email.trim() === '') {
      throw new ValidationError("Email is required", undefined, context);
    }

    if (!phone || phone.trim() === '') {
      throw new ValidationError("Phone number is required", undefined, context);
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new ValidationError("Invalid email format", undefined, context);
    }

    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
      throw new ValidationError("Invalid phone number format", undefined, context);
    }

    this.validateAddress(address, context);
  }

  private validateAddress(address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  }, context: string): void {
    if (!address.street || address.street.trim() === '') {
      throw new ValidationError("Street address is required", undefined, context);
    }

    if (!address.city || address.city.trim() === '') {
      throw new ValidationError("City is required", undefined, context);
    }

    if (!address.state || address.state.trim() === '') {
      throw new ValidationError("State is required", undefined, context);
    }

    if (!address.zipCode || address.zipCode.trim() === '') {
      throw new ValidationError("Zip code is required", undefined, context);
    }

    if (!address.country || address.country.trim() === '') {
      throw new ValidationError("Country is required", undefined, context);
    }

    const zipCodeRegex = /^\d{5}(-\d{4})?$/;
    if (!zipCodeRegex.test(address.zipCode)) {
      throw new ValidationError("Invalid zip code format", undefined, context);
    } 
  }
}
