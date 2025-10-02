export interface AwardProps {
  _id?: string;
  title: string;
  description: string;
  category: AwardCategory;
  level: AwardLevel;
  dateAwarded: Date;
  points: number;
  imageUrl?: string | undefined;
  criteria: string;
  petId: string;
  clientId: string;
  awardedBy: string;
  isValid: boolean;
  expirationDate?: Date | undefined;
  metadata?: AwardMetadata | undefined;
  createdAt?: Date;
  updatedAt?: Date;
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
  competitionName?: string | undefined;
  score?: number | undefined;
  rank?: number | undefined;
  location?: string | undefined;
  judges?: string[] | undefined;
  certificateNumber?: string | undefined;
  specialNotes?: string | undefined;
}

export class Award {
  public readonly _id: string;
  public readonly title: string;
  public readonly description: string;
  public readonly category: AwardCategory;
  public readonly level: AwardLevel;
  public readonly dateAwarded: Date;
  public readonly points: number;
  public readonly imageUrl: string | undefined;
  public readonly criteria: string;
  public readonly petId: string;
  public readonly clientId: string;
  public readonly awardedBy: string;
  public readonly isValid: boolean;
  public readonly expirationDate: Date | undefined;
  public readonly metadata: AwardMetadata | undefined;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: AwardProps) {
    this._id = props._id || "";
    this.title = props.title;
    this.description = props.description;
    this.category = props.category;
    this.level = props.level;
    this.dateAwarded = props.dateAwarded;
    this.points = props.points;
    this.imageUrl = props.imageUrl;
    this.criteria = props.criteria;
    this.petId = props.petId;
    this.clientId = props.clientId;
    this.awardedBy = props.awardedBy;
    this.isValid = props.isValid ?? true;
    this.expirationDate = props.expirationDate;
    this.metadata = props.metadata;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: AwardProps): Award {
    const award = new Award(props);
    return award;
  }

  public update(props: Partial<Omit<AwardProps, '_id' | 'createdAt' | 'petId' | 'clientId'>>): Award {
    return new Award({
      ...this,
      ...props,
      updatedAt: new Date(),
    });
  }

  public revoke(): Award {
    return new Award({
      ...this,
      isValid: false,
      updatedAt: new Date(),
    });
  }

  public reinstate(): Award {
    return new Award({
      ...this,
      isValid: true,
      updatedAt: new Date(),
    });
  }

  public isExpired(): boolean {
    if (!this.expirationDate) return false;
    return new Date() > this.expirationDate;
  }

  public getAwardValue(): number {
    const levelMultiplier = {
      [AwardLevel.BRONZE]: 1,
      [AwardLevel.SILVER]: 2,
      [AwardLevel.GOLD]: 3,
      [AwardLevel.PLATINUM]: 4,
      [AwardLevel.DIAMOND]: 5
    };

    return this.points * levelMultiplier[this.level];
  }

  public updateMetadata(metadata: Partial<AwardMetadata>): Award {
    return new Award({
      ...this,
      metadata: { ...this.metadata, ...metadata },
      updatedAt: new Date(),
    });
  }
}
