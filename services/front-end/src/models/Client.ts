export interface Client {
  _id: string;
  email: string; 
  firstName: string;
  lastName: string; 
  phone: string;
  isActive: boolean;
  address: Address;
  createdAt: string;
  updatedAt: string;
} 

export interface Address {
  _id: string;
  street: string;
  city: string;
  state: string;
  country: string;
  zipCode: string;
}
               
              