import { Pet } from "./Pet";
import mongoose from 'mongoose';

export interface ClientProps {
  _id?: string | mongoose.Types.ObjectId | undefined;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profileImage?: string | undefined;
  role: string;
  address: Address;
  pets: Pet[]; 
  isActive?: boolean | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

export class Client {
  public readonly _id: string;
  public readonly firstName: string;
  public readonly lastName: string;
  public readonly email: string;
  public readonly phone: string | null;
  public readonly profileImage: string | undefined; 
  public readonly role: string;
  public readonly address: Address;
  public readonly pets: Pet[];
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date; 

  private constructor(props: ClientProps) {
    if (props._id instanceof mongoose.Types.ObjectId) {
      this._id = props._id.toString();
    } else {
      this._id = props._id || new mongoose.Types.ObjectId().toString();
    }
    
    this.firstName = props.firstName;
    this.lastName = props.lastName;
    this.email = props.email;
    this.phone = props.phone;
    this.profileImage = props.profileImage;
    this.role = props.role; 
    this.address = props.address;
    this.pets = props.pets || [];
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date(); 
  }

  public static create(props: ClientProps): Client {
    const client = new Client(props); 
    return client;
  }

  public update(props: Partial<Omit<ClientProps, '_id' | 'createdAt'>>): Client {
    return new Client({
      ...(this as ClientProps),
      ...props,
      updatedAt: new Date(),
    });
  }

  public updateProfileImage(profileImage: string): Client {
    return new Client({
      ...(this as ClientProps),
      profileImage,
      updatedAt: new Date(),
    });
  }

  public addPet(pet: Pet): Client {
    const updatedPets = [...this.pets, pet];
    return new Client({
      ...(this as ClientProps),
      pets: updatedPets,
      updatedAt: new Date(),
    });
  }

  public removePet(petId: string): Client {
    const updatedPets = this.pets.filter(pet => pet._id !== petId);
    return new Client({
      ...(this as ClientProps),
      pets: updatedPets,
      updatedAt: new Date(),
    });
  }

  public updatePet(updatedPet: Pet): Client {
    const updatedPets = this.pets.map(pet => 
      pet._id === updatedPet._id ? updatedPet : pet
    );
    return new Client({
      ...(this as ClientProps),
      pets: updatedPets,
      updatedAt: new Date(),
    });
  }

  public getPet(petId: string): Pet | undefined {
    return this.pets.find(pet => pet._id === petId);
  }

  public deactivate(): Client {
    return new Client({
      ...(this as ClientProps),
      isActive: false,
      updatedAt: new Date(),
    });
  }

  public activate(): Client {
    return new Client({
      ...(this as ClientProps),
      isActive: true,
      updatedAt: new Date(),
    });
  }
}
