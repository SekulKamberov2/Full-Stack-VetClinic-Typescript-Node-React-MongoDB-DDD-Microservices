export interface DomainEvent {
  type: string;
  aggregateId: string;
  occurredOn: Date;
  payload: any;
  version: number;  
}

export class ClientCreatedEvent implements DomainEvent {
  readonly type = 'ClientCreatedEvent'; 
  readonly version = 1; 
  
  constructor(
    public readonly aggregateId: string,
    public readonly payload: {
      userId: string;
      clientId: string;
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      role: string;
      address: {   
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
      };
      createdAt: Date;
    },
    public readonly occurredOn: Date = new Date()
  ) {}
}
