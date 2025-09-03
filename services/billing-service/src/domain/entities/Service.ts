export interface ServiceProps {
  id?: string;
  name: string;
  description: string;
  category: string;
  price: number;
  duration: number;  
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Service {
  public readonly id: string;
  public readonly name: string;
  public readonly description: string;
  public readonly category: string;
  public readonly price: number;
  public readonly duration: number;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: ServiceProps) {
    this.id = props.id || "";
    this.name = props.name;
    this.description = props.description;
    this.category = props.category;
    this.price = props.price;
    this.duration = props.duration;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: ServiceProps): Service {
    return new Service(props);
  }

  public update(updateData: Partial<Omit<ServiceProps, 'id' | 'createdAt'>>): Service {
    return new Service({
      ...this,
      ...updateData,
      updatedAt: new Date(),
    });
  }

  public deactivate(): Service {
    return new Service({
      ...this,
      isActive: false,
      updatedAt: new Date(),
    });
  }
}