import { Award } from '../entities/Award';
import { AwardCategory, AwardLevel } from '../entities/Award';

export interface AwardRepository {
  findById(id: string): Promise<Award | null>;
  findByPetId(petId: string): Promise<Award[]>;
  findByClientId(clientId: string): Promise<Award[]>;
  findByCategory(category: AwardCategory): Promise<Award[]>;
  findByLevel(level: AwardLevel): Promise<Award[]>;
  save(award: Award): Promise<Award>;
  update(award: Award): Promise<void>;
  delete(id: string): Promise<void>;
  exists(id: string): Promise<boolean>;
   findAll(): Promise<Award[]>;
  getAwardStats(): Promise<{
    totalAwards: number;
    awardsByCategory: Record<string, number>;
    awardsByLevel: Record<string, number>;
    totalPointsAwarded: number;
  }>;
}
