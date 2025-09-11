"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateClientUseCase = void 0;
const Client_1 = require("../../domain/entities/Client");
const shared_kernel_1 = require("@vetclinic/shared-kernel");
class CreateClientUseCase {
    constructor(clientRepository, eventPublisher) {
        this.clientRepository = clientRepository;
        this.eventPublisher = eventPublisher;
    }
    async execute(clientData) {
        try {
            this.validateClientData(clientData);
            const existingClient = await this.clientRepository.findByEmail(clientData.email);
            if (existingClient) {
                throw new shared_kernel_1.DuplicateError(`Client with email ${clientData.email} already exists`, undefined, 'CreateClientUseCase', 'email');
            }
            const client = Client_1.Client.create(clientData);
            const savedClient = await this.clientRepository.save(client);
            // Publish domain event with actual MongoDB ID
            // await this.eventPublisher.publish('ClientCreated', {
            //   clientId: savedClient.id,  // Use the ID from saved client
            //   firstName: savedClient.firstName,
            //   lastName: savedClient.lastName,
            //   email: savedClient.email,
            //   phone: savedClient.phone,
            // });
            return savedClient;
        }
        catch (error) {
            return shared_kernel_1.ErrorHandler.handleAppError(error, 'Create client');
        }
    }
    validateClientData(clientData) {
        const { firstName, lastName, email, phone, address } = clientData;
        const context = 'CreateClientUseCase';
        if (!firstName || firstName.trim() === '') {
            throw new shared_kernel_1.ValidationError("First name is required", undefined, context);
        }
        if (!lastName || lastName.trim() === '') {
            throw new shared_kernel_1.ValidationError("Last name is required", undefined, context);
        }
        if (!email || email.trim() === '') {
            throw new shared_kernel_1.ValidationError("Email is required", undefined, context);
        }
        if (!phone || phone.trim() === '') {
            throw new shared_kernel_1.ValidationError("Phone number is required", undefined, context);
        }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new shared_kernel_1.ValidationError("Invalid email format", undefined, context);
        }
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''))) {
            throw new shared_kernel_1.ValidationError("Invalid phone number format", undefined, context);
        }
        this.validateAddress(address, context);
    }
    validateAddress(address, context) {
        if (!address.street || address.street.trim() === '') {
            throw new shared_kernel_1.ValidationError("Street address is required", undefined, context);
        }
        if (!address.city || address.city.trim() === '') {
            throw new shared_kernel_1.ValidationError("City is required", undefined, context);
        }
        if (!address.state || address.state.trim() === '') {
            throw new shared_kernel_1.ValidationError("State is required", undefined, context);
        }
        if (!address.zipCode || address.zipCode.trim() === '') {
            throw new shared_kernel_1.ValidationError("Zip code is required", undefined, context);
        }
        if (!address.country || address.country.trim() === '') {
            throw new shared_kernel_1.ValidationError("Country is required", undefined, context);
        }
        const zipCodeRegex = /^\d{5}(-\d{4})?$/;
        if (!zipCodeRegex.test(address.zipCode)) {
            throw new shared_kernel_1.ValidationError("Invalid zip code format", undefined, context);
        }
    }
}
exports.CreateClientUseCase = CreateClientUseCase;
