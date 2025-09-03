export interface ClientProps {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: Address;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export class Client {
  public readonly id: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly email: string;
  public readonly phone: string;
  public readonly address: Address;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: ClientProps) {
    this.id = props.id || "";
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
    this.phone = props.phone;
    this.address = props.address;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: ClientProps): Client {
    const client = new Client(props);
    // Domain event: ClientCreatedEvent to be added here
    return client;
  }

  public update(props: Partial<Omit<ClientProps, 'id' | 'createdAt'>>): Client {
    return new Client({
      ...this,
      ...props,
      updatedAt: new Date(),
    });
  }

  public deactivate(): Client {
    return new Client({
      ...this,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  public activate(): Client {
    return new Client({
      ...this,
      isActive: true,
      updatedAt: new Date(),
    });
  }
}