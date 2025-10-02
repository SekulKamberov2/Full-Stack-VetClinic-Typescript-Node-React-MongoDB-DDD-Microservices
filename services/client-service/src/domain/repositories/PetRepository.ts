import { Pet } from '../entities/Pet';

export interface PetRepository {
  findById(id: string): Promise<Pet | null>;
  findByClientId(clientId: string): Promise<Pet[]>;
  findByName(name: string): Promise<Pet[]>;
  findBySpecies(species: string): Promise<Pet[]>;
  save(pet: Pet): Promise<Pet>;
  update(pet: Pet): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
  searchPets(query: string): Promise<Pet[]>;
  findAll(): Promise<Pet[]>;
  getPetStats(): Promise<{
    totalPets: number;
    activePets: number;
    petsBySpecies: Record<string, number>;
    averageAge: number;
  }>;
}