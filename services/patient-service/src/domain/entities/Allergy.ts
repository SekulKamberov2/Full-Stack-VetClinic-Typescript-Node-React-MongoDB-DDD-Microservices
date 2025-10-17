export interface AllergyProps {
  id?: string;
  patientId: string;
  allergen: string;
  reaction: string;
  severity: AllergySeverity;
  firstObserved: Date;
  isActive: boolean;
  notes?: string | "";
  createdAt?: Date;
  updatedAt?: Date;
}

export enum AllergySeverity {
  MILD = 'mild',
  MODERATE = 'moderate',
  SEVERE = 'severe'
}

export class Allergy {
  public readonly id: string;
  public readonly patientId: string;
  public readonly allergen: string;
  public readonly reaction: string;
  public readonly severity: AllergySeverity;
  public readonly firstObserved: Date;
  public readonly isActive: boolean; 
  public readonly notes: string; 
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: AllergyProps) {
    this.id = props.id || "";
    this.patientId = props.patientId;
    this.allergen = props.allergen;
    this.reaction = props.reaction;
    this.severity = props.severity;
    this.firstObserved = props.firstObserved;
    this.isActive = props.isActive;
    this.notes = props.notes || "";
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: AllergyProps): Allergy {
    return new Allergy(props);
  }

  public update(updateData: Partial<Omit<AllergyProps, 'id' | 'createdAt' | 'patientId'>>): Allergy {
    return new Allergy({
      ...this,
      ...updateData,
      updatedAt: new Date(),
    });
  }

  public deactivate(): Allergy {
    return new Allergy({
      ...this,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  public activate(): Allergy {
    return new Allergy({
      ...this,
      isActive: true,
      updatedAt: new Date(),
    });
  }
}
