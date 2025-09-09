import { ValidationError } from "@vetclinic/shared-kernel";

export type PrescriptionStatus = 'pending' | 'filled' | 'cancelled' | 'completed';

export interface PrescriptionProps {
  id?: string | undefined;
  recordId?: string | undefined;  
  medicationName: string;
  dosage: string;
  instructions: string;
  datePrescribed?: Date | undefined;
  refills: number;
  filledDate?: Date | undefined;
  filledBy?: string | undefined;
  status?: PrescriptionStatus | undefined;
  createdAt?: Date | undefined;
  updatedAt?: Date | undefined;
}

export class Prescription {
  public readonly id: string;
  public readonly recordId: string;
  public readonly medicationName: string;
  public readonly dosage: string;
  public readonly instructions: string;
  public readonly datePrescribed: Date;
  public readonly refills: number;
  public readonly filledDate?: Date | undefined;
  public readonly filledBy?: string | undefined;
  public readonly status: PrescriptionStatus;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: PrescriptionProps) {
    this.id = props.id || "";
    this.recordId = props.recordId || ""; 
    this.medicationName = props.medicationName;
    this.dosage = props.dosage;
    this.instructions = props.instructions;
    this.datePrescribed = props.datePrescribed || new Date();
    this.refills = props.refills;
    this.filledDate = props.filledDate;
    this.filledBy = props.filledBy;
    this.status = props.status || 'pending';
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: PrescriptionProps): Prescription { 
    if (!props.medicationName || props.medicationName.trim() === '') {
      throw new ValidationError("Medication name is required", undefined, 'Prescription validation');
    }

    if (props.medicationName.length > 100) {
      throw new ValidationError("Medication name cannot exceed 100 characters", undefined, 'Prescription validation');
    }

    if (!props.dosage || props.dosage.trim() === '') {
      throw new ValidationError("Dosage is required", undefined, 'Prescription validation');
    }

    if (props.dosage.length > 50) {
      throw new ValidationError("Dosage cannot exceed 50 characters", undefined, 'Prescription validation');
    }

    if (!props.instructions || props.instructions.trim() === '') {
      throw new ValidationError("Instructions are required", undefined, 'Prescription validation');
    }

    if (props.instructions.length > 500) {
      throw new ValidationError("Instructions cannot exceed 500 characters", undefined, 'Prescription validation');
    }

    if (props.refills < 0) {
      throw new ValidationError("Refills cannot be negative", undefined, 'Prescription validation');
    }

    if (props.refills > 10) {
      throw new ValidationError("Refills cannot exceed 10", undefined, 'Prescription validation');
    }

    return new Prescription(props);
  }

  public update(updateData: Partial<Omit<PrescriptionProps, 'id' | 'recordId'>>): Prescription { 
    if (updateData.medicationName !== undefined) {
      if (!updateData.medicationName || updateData.medicationName.trim() === '') {
        throw new ValidationError("Medication name is required", undefined, 'Prescription validation');
      }
      if (updateData.medicationName.length > 100) {
        throw new ValidationError("Medication name cannot exceed 100 characters", undefined, 'Prescription validation');
      }
    }
 
    if (updateData.dosage !== undefined) {
      if (!updateData.dosage || updateData.dosage.trim() === '') {
        throw new ValidationError("Dosage is required", undefined, 'Prescription validation');
      }
      if (updateData.dosage.length > 50) {
        throw new ValidationError("Dosage cannot exceed 50 characters", undefined, 'Prescription validation');
      }
    }
 
    if (updateData.instructions !== undefined) {
      if (!updateData.instructions || updateData.instructions.trim() === '') {
        throw new ValidationError("Instructions are required", undefined, 'Prescription validation');
      }
      if (updateData.instructions.length > 500) {
        throw new ValidationError("Instructions cannot exceed 500 characters", undefined, 'Prescription validation');
      }
    }
 
    if (updateData.refills !== undefined) {
      if (updateData.refills < 0) {
        throw new ValidationError("Refills cannot be negative", undefined, 'Prescription validation');
      }
      if (updateData.refills > 10) {
        throw new ValidationError("Refills cannot exceed 10", undefined, 'Prescription validation');
      }
    }

    return new Prescription({
      ...this.toProps(),
      ...updateData,
      updatedAt: new Date(),
    });
  }

  public setRecordId(recordId: string): Prescription {
    if (!recordId || recordId.trim() === '') {
      throw new ValidationError("Record ID cannot be empty", undefined, 'Prescription validation');
    }

    if (recordId.length < 3) {
      throw new ValidationError("Record ID appears to be invalid", undefined, 'Prescription validation');
    }

    return new Prescription({
      ...this.toProps(),
      recordId,
    });
  }

  public setId(id: string): Prescription {
    if (!id || id.trim() === '') {
      throw new ValidationError("ID cannot be empty", undefined, 'Prescription validation');
    }

    if (id.length < 3) {
      throw new ValidationError("ID appears to be invalid", undefined, 'Prescription validation');
    }

    return new Prescription({
      ...this.toProps(),
      id,
    });
  }

  public toProps(): PrescriptionProps {
    return {
      id: this.id,
      recordId: this.recordId,
      medicationName: this.medicationName,
      dosage: this.dosage,
      instructions: this.instructions,
      datePrescribed: this.datePrescribed,
      refills: this.refills,
      filledDate: this.filledDate,
      filledBy: this.filledBy,
      status: this.status,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
    };
  }

  public isNew(): boolean {
    return !this.id || this.id.trim() === '';
  }
 
  public markAsFilled(filledBy: string, filledDate: Date = new Date()): Prescription {
    if (!filledBy || filledBy.trim() === '') {
      throw new ValidationError("Filled by cannot be empty", undefined, 'Prescription validation');
    }

    if (filledBy.length < 2) {
      throw new ValidationError("Filled by appears to be invalid", undefined, 'Prescription validation');
    }

    return this.update({
      status: 'filled',
      filledBy,
      filledDate,
    });
  }

  public markAsPending(): Prescription {
    return this.update({
      status: 'pending',
      filledBy: undefined,
      filledDate: undefined,
    });
  }

  public cancel(): Prescription {
    return this.update({
      status: 'cancelled',
    });
  }

  public complete(): Prescription {
    return this.update({
      status: 'completed',
    });
  }

  public hasRefillsAvailable(): boolean {
    return this.refills > 0;
  }

  public isFilled(): boolean {
    return this.status === 'filled' || this.status === 'completed';
  }

  public isPending(): boolean {
    return this.status === 'pending';
  }
 
  public isExpired(): boolean {
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    return this.datePrescribed < oneYearAgo;
  }

  public isValid(): boolean {
    return this.medicationName.trim() !== '' &&
           this.medicationName.length <= 100 &&
           this.dosage.trim() !== '' &&
           this.dosage.length <= 50 &&
           this.instructions.trim() !== '' &&
           this.instructions.length <= 500 &&
           this.refills >= 0 &&
           this.refills <= 10 &&
           this.recordId.trim() !== '' &&
           this.datePrescribed <= new Date() &&
           (!this.filledBy || this.filledBy.trim() !== '') &&
           (!this.filledDate || this.filledDate <= new Date());
  }

  public getSummary(): string {
    return `${this.medicationName} - ${this.dosage} (${this.status})`;
  }

  public canBeFilled(): boolean {
    return this.isPending() && !this.isExpired();
  }

  public requiresRefill(): boolean {
    return this.isFilled() && this.hasRefillsAvailable();
  }
}
