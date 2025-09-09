import { ValidationError } from "@vetclinic/shared-kernel";
 
export interface TreatmentProps {
  id?: string | undefined;
  recordId?: string | undefined; 
  name: string;
  description: string;
  date?: Date | undefined;
  cost: number;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export class Treatment {
  public readonly id: string;
  public readonly recordId: string;  
  public readonly name: string;
  public readonly description: string;
  public readonly date: Date;
  public readonly cost: number;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: TreatmentProps) {
    this.id = props.id || "";
    this.recordId = props.recordId || ""; 
    this.name = props.name;
    this.description = props.description;
    this.date = props.date || new Date();
    this.cost = props.cost;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: TreatmentProps): Treatment { 
    if (!props.name || props.name.trim() === '') {
      throw new ValidationError("Name is required", undefined, 'Treatment validation');
    }

    if (props.name.length > 100) {
      throw new ValidationError("Name cannot exceed 100 characters", undefined, 'Treatment validation');
    }

    if (!props.description || props.description.trim() === '') {
      throw new ValidationError("Description is required", undefined, 'Treatment validation');
    }

    if (props.description.length > 500) {
      throw new ValidationError("Description cannot exceed 500 characters", undefined, 'Treatment validation');
    }

    if (props.cost < 0) {
      throw new ValidationError("Cost cannot be negative", undefined, 'Treatment validation');
    }

    if (props.cost > 10000) {
      throw new ValidationError("Cost cannot exceed $10,000", undefined, 'Treatment validation');
    }

    return new Treatment(props);
  }

  public update(updateData: Partial<Omit<TreatmentProps, 'id' | 'recordId'>>): Treatment { 
    if (updateData.name !== undefined) {
      if (!updateData.name || updateData.name.trim() === '') {
        throw new ValidationError("Name is required", undefined, 'Treatment validation');
      }
      if (updateData.name.length > 100) {
        throw new ValidationError("Name cannot exceed 100 characters", undefined, 'Treatment validation');
      }
    }
 
    if (updateData.description !== undefined) {
      if (!updateData.description || updateData.description.trim() === '') {
        throw new ValidationError("Description is required", undefined, 'Treatment validation');
      }
      if (updateData.description.length > 500) {
        throw new ValidationError("Description cannot exceed 500 characters", undefined, 'Treatment validation');
      }
    }
 
    if (updateData.cost !== undefined) {
      if (updateData.cost < 0) {
        throw new ValidationError("Cost cannot be negative", undefined, 'Treatment validation');
      }
      if (updateData.cost > 10000) {
        throw new ValidationError("Cost cannot exceed $10,000", undefined, 'Treatment validation');
      }
    }

    return new Treatment({
      ...this.toProps(),
      ...updateData,
      updatedAt: new Date(),
    });
  }

  public setRecordId(recordId: string): Treatment {
    if (!recordId || recordId.trim() === '') {
      throw new ValidationError("Record ID cannot be empty", undefined, 'Treatment validation');
    }

    if (recordId.length < 3) {
      throw new ValidationError("Record ID appears to be invalid", undefined, 'Treatment validation');
    }

    return new Treatment({
      ...this.toProps(),
      recordId,
    });
  }

  public setId(id: string): Treatment {
    if (!id || id.trim() === '') {
      throw new ValidationError("ID cannot be empty", undefined, 'Treatment validation');
    }

    if (id.length < 3) {
      throw new ValidationError("ID appears to be invalid", undefined, 'Treatment validation');
    }

    return new Treatment({
      ...this.toProps(),
      id,
    });
  }

  public toProps(): TreatmentProps {
    return {
      id: this.id,
      recordId: this.recordId,
      name: this.name,
      description: this.description,
      date: this.date,
      cost: this.cost,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public isNew(): boolean {
    return !this.id || this.id.trim() === '';
  }

  public getFormattedCost(): string {
    return `$${this.cost.toFixed(2)}`;
  }

  public isRecent(): boolean {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    return this.date >= thirtyDaysAgo;
  }

  public isValid(): boolean {
    return this.name.trim() !== '' &&
           this.name.length <= 100 &&
           this.description.trim() !== '' &&
           this.description.length <= 500 &&
           this.cost >= 0 &&
           this.cost <= 10000 &&
           this.recordId.trim() !== '' &&
           this.date <= new Date();
  }

  public getSummary(): string {
    return `${this.name} - ${this.getFormattedCost()}`;
  }

  public isExpensive(): boolean {
    return this.cost > 500;
  }

  public isStandardCost(): boolean {
    return this.cost >= 50 && this.cost <= 500;
  }

  public isLowCost(): boolean {
    return this.cost < 50;
  }

  public updateCost(newCost: number): Treatment {
    if (newCost < 0) {
      throw new ValidationError("Cost cannot be negative", undefined, 'Treatment validation');
    }

    if (newCost > 10000) {
      throw new ValidationError("Cost cannot exceed $10,000", undefined, 'Treatment validation');
    }

    return this.update({ cost: newCost });
  }

  public updateDescription(newDescription: string): Treatment {
    if (!newDescription || newDescription.trim() === '') {
      throw new ValidationError("Description is required", undefined, 'Treatment validation');
    }

    if (newDescription.length > 500) {
      throw new ValidationError("Description cannot exceed 500 characters", undefined, 'Treatment validation');
    }

    return this.update({ description: newDescription });
  }

  public updateName(newName: string): Treatment {
    if (!newName || newName.trim() === '') {
      throw new ValidationError("Name is required", undefined, 'Treatment validation');
    }

    if (newName.length > 100) {
      throw new ValidationError("Name cannot exceed 100 characters", undefined, 'Treatment validation');
    }

    return this.update({ name: newName });
  }

  public isFutureDated(): boolean {
    return this.date > new Date();
  }

  public isPastDated(): boolean {
    return this.date < new Date();
  }

  public isToday(): boolean {
    const today = new Date();
    return this.date.toDateString() === today.toDateString();
  }
}
