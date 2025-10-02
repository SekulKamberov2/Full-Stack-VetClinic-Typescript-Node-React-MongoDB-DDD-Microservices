import { CreateClientUseCase } from "src/application/use-cases/CreateClientUseCase";
import { EventHandler } from "./EventHandler";

export class ClientCreatedEventHandler implements EventHandler {
  constructor(private createClientUseCase: CreateClientUseCase) {}

  async handle(event: any): Promise<void> {
    try {
      console.log('Received ClientCreatedEvent:', event);

      const { userId, firstName, lastName, email, phone, address } = event.data;

      await this.createClientUseCase.execute({
        id: userId,
        firstName,
        lastName,
        email,
        phone: phone || '+0000000000',
        address: address || {
          street: 'Unknown',
          city: 'Unknown',
          state: 'Unknown',
          zipCode: '00000',
          country: 'Unknown'
        }
      });

      console.log('Client created from event:', email);
    } catch (error) {
      console.error('Error handling ClientCreatedEvent:', error);
      throw error;
    }
  }

  getEventType(): string {
    return 'ClientCreatedEvent';
  }
}
