import { Service } from '../entities/Service';

export enum ServiceCategory {
  CONSULTATION = 'consultation',
  VACCINATION = 'vaccination',
  SURGERY = 'surgery',
  DENTAL = 'dental',
  GROOMING = 'grooming',
  DIAGNOSTIC = 'diagnostic',
  EMERGENCY = 'emergency',
  BOARDING = 'boarding',
  OTHER = 'other'
}

export interface ServiceRepository {
  findById(id: string): Promise<Service | null>;
  findByName(name: string): Promise<Service[] | null>;
  findByCategory(category: ServiceCategory): Promise<Service[]>;
  findByPriceRange(minPrice: number, maxPrice: number): Promise<Service[]>;
  findAllActive(): Promise<Service[]>;
  findAll(): Promise<Service[]>;
  save(service: Service): Promise<Service>;
  update(service: Service): Promise<void>;
  delete(id: string): Promise<void>;
  searchServices(query: string): Promise<Service[]>;  
  search(query: string): Promise<Service[]>; 
  getServiceStats(): Promise<{
    total: number;
    active: number;
    byCategory: Record<string, number>;
    priceRange: { min: number; max: number; average: number };
  }>;
  getStats(): Promise<{
    totalServices: number;
    activeServices: number;
    servicesByCategory: Record<string, number>;
  }>;
  reactivate(id: string): Promise<void>;
}