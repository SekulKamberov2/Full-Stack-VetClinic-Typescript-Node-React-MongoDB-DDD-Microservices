import { ValidationError } from "@vetclinic/shared-kernel"; 

export interface DiagnosisProps {
  id?: string | undefined;
  recordId?: string | undefined;  
  description: string;
  date?: Date | undefined;
  notes?: string | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export class Diagnosis {
  public readonly id: string;
  public readonly recordId: string;
  public readonly description: string;
  public readonly date: Date;
  public readonly notes?: string | undefined;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: DiagnosisProps) {
    this.id = props.id || "";
    this.recordId = props.recordId || ""; 
    this.description = props.description;
    this.date = props.date || new Date();
    this.notes = props.notes;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: DiagnosisProps): Diagnosis { 
    if (!props.description || props.description.trim() === '') {
      throw new ValidationError("Description is required", undefined, 'Diagnosis validation');
    }

    if (props.description.length > 500) {
      throw new ValidationError("Description cannot exceed 500 characters", undefined, 'Diagnosis validation');
    }

    if (props.notes && props.notes.length > 1000) {
      throw new ValidationError("Notes cannot exceed 1000 characters", undefined, 'Diagnosis validation');
    }

    return new Diagnosis(props);
  }

  public updateDetails(updateData: Partial<Omit<DiagnosisProps, 'id' | 'recordId'>>): Diagnosis {
    if (updateData.description && (!updateData.description || updateData.description.trim() === '')) {
      throw new ValidationError("Description is required", undefined, 'Diagnosis validation');
    }

    if (updateData.description && updateData.description.length > 500) {
      throw new ValidationError("Description cannot exceed 500 characters", undefined, 'Diagnosis validation');
    }

    if (updateData.notes && updateData.notes.length > 1000) {
      throw new ValidationError("Notes cannot exceed 1000 characters", undefined, 'Diagnosis validation');
    }

    return new Diagnosis({
      ...this.toProps(),
      ...updateData,
      updatedAt: new Date(),
    });
  }

  public setRecordId(recordId: string): Diagnosis {
    if (!recordId || recordId.trim() === '') {
      throw new ValidationError("Record ID cannot be empty", undefined, 'Diagnosis validation');
    }

    if (recordId.length < 3) {
      throw new ValidationError("Record ID appears to be invalid", undefined, 'Diagnosis validation');
    }

    return new Diagnosis({
      ...this.toProps(),
      recordId,
    });
  }

  public setId(id: string): Diagnosis {
    if (!id || id.trim() === '') {
      throw new ValidationError("ID cannot be empty", undefined, 'Diagnosis validation');
    }

    if (id.length < 3) {
      throw new ValidationError("ID appears to be invalid", undefined, 'Diagnosis validation');
    }

    return new Diagnosis({
      ...this.toProps(),
      id,
    });
  }

  public toProps(): DiagnosisProps {
    return {
      id: this.id,
      recordId: this.recordId,
      description: this.description,
      date: this.date,
      notes: this.notes,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public isValid(): boolean {
    return this.description.trim() !== '' && 
           this.description.length <= 500 &&
           (!this.notes || this.notes.length <= 1000) &&
           this.recordId.trim() !== '' &&
           this.date <= new Date();
  }

  public getSummary(): string {
    return `${this.description} (${this.date.toLocaleDateString()})`;
  }

  public hasNotes(): boolean {
    return !!this.notes && this.notes.trim() !== '';
  }

  public isRecent(maxDays: number = 30): boolean {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - maxDays);
    return this.date >= cutoffDate;
  }
}
