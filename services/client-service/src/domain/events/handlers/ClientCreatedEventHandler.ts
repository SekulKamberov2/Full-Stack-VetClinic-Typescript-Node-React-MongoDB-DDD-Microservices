import { CreateClientUseCase } from "src/application/use-cases/CreateClientUseCase";
import { EventHandler } from "./EventHandler";

export class ClientCreatedEventHandler implements EventHandler {
  constructor(private createClientUseCase: CreateClientUseCase) {}

  async handle(event: any): Promise<void> {
    try {
      console.log('CLIENT CREATED EVENT HANDLER: Starting to process event');
      console.log('Raw event received:', JSON.stringify(event, null, 2));

      if (!event) {
        console.error('EVENT HANDLER: Event is null or undefined');
        return;
      }

      if (!event.data) {
        console.error('EVENT HANDLER: Event missing data property');
        console.error('Event structure received:', event);
        return;
      }

      const eventData = event.data;
      console.log('👤 Processing event for user:', eventData.email);
      
      if (!eventData.userId) {
        console.error('EVENT HANDLER: Missing userId in event data');
        console.error('Event data structure:', eventData);
        return;
      }

      if (!eventData.firstName) {
        console.error('EVENT HANDLER: Missing firstName in event data');
        return;
      }

      if (!eventData.lastName) {
        console.error('EVENT HANDLER: Missing lastName in event data');
        return;
      }

      if (!eventData.email) {
        console.error('EVENT HANDLER: Missing email in event data');
        return;
      }

      console.log('Event data validation passed');

      const clientData = {
        id: eventData.userId,
        firstName: eventData.firstName,
        lastName: eventData.lastName,
        email: eventData.email,
        phone: eventData.phone,
        role: eventData.role,
        address: eventData.address || {
          street: 'Not provided',
          city: 'Not provided', 
          state: 'Not provided',
          zipCode: '00000',
          country: 'Not provided'
        },
        profileImage: '',
        pets: [],
        isActive: true
      };

      console.log('Mapped client data for creation:');
      console.log('ID:', clientData.id);
      console.log('Name:', clientData.firstName, clientData.lastName);
      console.log('Email:', clientData.email);
      console.log('Phone:', clientData.phone);
      console.log('Role:', clientData.role);
      console.log('Full client data:', JSON.stringify(clientData, null, 2));

      console.log('About to execute CreateClientUseCase...');

      const result = await this.createClientUseCase.execute(clientData);

      console.log('CLIENT CREATED EVENT HANDLER: Client profile created successfully for:', eventData.email);
      console.log('Created client ID:', result._id);

    } catch (error) {
      console.error('CLIENT CREATED EVENT HANDLER: Error creating client from event:');
      console.error('Error details:', error);
      console.error('Event that caused error:', JSON.stringify(event, null, 2));
    }
  }

  getEventType(): string {
    return 'ClientCreatedEvent';    
  }
}
