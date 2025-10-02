export interface Award {
  _id: string;
  title: string;
  description: string;
  category: AwardCategory;
  level: AwardLevel;
  dateAwarded: string;
  points: number;
  imageUrl?: string;
  criteria: string;
  petId: string;
  clientId: string;
  awardedBy: string;
  isValid: boolean;
  expirationDate?: string;
  metadata?: AwardMetadata;
  createdAt: string;
  updatedAt: string;
}

export enum AwardCategory {
  HEALTH = 'health',
  TRAINING = 'training',
  COMPETITION = 'competition',
  SERVICE = 'service',
  COMMUNITY = 'community',
  BEHAVIOR = 'behavior',
  GROOMING = 'grooming',
  ATHLETIC = 'athletic'
}

export enum AwardLevel {
  BRONZE = 'bronze',
  SILVER = 'silver',
  GOLD = 'gold',
  PLATINUM = 'platinum',
  DIAMOND = 'diamond'
}

export interface AwardMetadata {
  competitionName?: string;
  score?: number;
  rank?: number;
  location?: string;
  judges?: string[];
  certificateNumber?: string;
  specialNotes?: string;
}

export const createAward = (data: Partial<Award>): Award => ({
  _id: data._id || '',
  title: data.title || '',
  description: data.description || '',
  category: data.category || AwardCategory.HEALTH,
  level: data.level || AwardLevel.BRONZE,
  dateAwarded: data.dateAwarded || new Date().toISOString(),
  points: data.points || 0,
  imageUrl: data.imageUrl,
  criteria: data.criteria || '',
  petId: data.petId || '',
  clientId: data.clientId || '',
  awardedBy: data.awardedBy || '',
  isValid: data.isValid ?? true,
  expirationDate: data.expirationDate,
  metadata: data.metadata,
  createdAt: data.createdAt || new Date().toISOString(),
  updatedAt: data.updatedAt || new Date().toISOString()
});

export const getAwardValue = (award: Award): number => {
  const levelMultiplier = {
    [AwardLevel.BRONZE]: 1,
    [AwardLevel.SILVER]: 2,
    [AwardLevel.GOLD]: 3,
    [AwardLevel.PLATINUM]: 4,
    [AwardLevel.DIAMOND]: 5
  };

  return award.points * levelMultiplier[award.level];
};

export const isAwardExpired = (award: Award): boolean => {
  if (!award.expirationDate) return false;
  return new Date() > new Date(award.expirationDate);
};

export const getAwardLevelColor = (level: AwardLevel): string => {
  const colors = {
    [AwardLevel.BRONZE]: '#cd7f32', // Bronze
    [AwardLevel.SILVER]: '#c0c0c0', // Silver
    [AwardLevel.GOLD]: '#ffd700',   // Gold
    [AwardLevel.PLATINUM]: '#e5e4e2', // Platinum
    [AwardLevel.DIAMOND]: '#b9f2ff'  // Diamond
  };
  return colors[level];
};

export const getAwardLevelLabel = (level: AwardLevel): string => {
  const labels = {
    [AwardLevel.BRONZE]: 'Bronze',
    [AwardLevel.SILVER]: 'Silver',
    [AwardLevel.GOLD]: 'Gold',
    [AwardLevel.PLATINUM]: 'Platinum',
    [AwardLevel.DIAMOND]: 'Diamond'
  };
  return labels[level];
};

export const getAwardCategoryLabel = (category: AwardCategory): string => {
  const labels = {
    [AwardCategory.HEALTH]: 'Health',
    [AwardCategory.TRAINING]: 'Training',
    [AwardCategory.COMPETITION]: 'Competition',
    [AwardCategory.SERVICE]: 'Service',
    [AwardCategory.COMMUNITY]: 'Community',
    [AwardCategory.BEHAVIOR]: 'Behavior',
    [AwardCategory.GROOMING]: 'Grooming',
    [AwardCategory.ATHLETIC]: 'Athletic'
  };
  return labels[category];
};

export interface CreateAwardData {
  title: string;
  description: string;
  category: AwardCategory;
  level: AwardLevel;
  points: number;
  criteria: string;
  petId: string;
  awardedBy: string;
  imageUrl?: string;
  expirationDate?: string;
  metadata?: AwardMetadata;
}

export interface UpdateAwardData {
  title?: string;
  description?: string;
  category?: AwardCategory;
  level?: AwardLevel;
  points?: number;
  imageUrl?: string;
  criteria?: string;
  isValid?: boolean;
  expirationDate?: string;
  metadata?: AwardMetadata;
}

export default Award;
