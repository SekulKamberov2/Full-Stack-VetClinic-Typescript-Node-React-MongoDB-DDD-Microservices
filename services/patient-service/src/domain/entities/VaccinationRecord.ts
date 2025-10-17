export interface VaccinationRecordProps {
  id?: string;
  patientId: string;
  vaccineName: string;
  dateAdministered: Date;
  nextDueDate: Date;
  administeredBy: string;
  lotNumber?: string;
  manufacturer?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export class VaccinationRecord {
  public readonly id: string;
  public readonly patientId: string;
  public readonly vaccineName: string;
  public readonly dateAdministered: Date;
  public readonly nextDueDate: Date;
  public readonly administeredBy: string;
  public readonly lotNumber: string | undefined;
  public readonly manufacturer: string | undefined;
  public readonly notes: string | undefined;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: VaccinationRecordProps) {
    this.id = props.id || "";
    this.patientId = props.patientId;
    this.vaccineName = props.vaccineName;
    this.dateAdministered = props.dateAdministered;
    this.nextDueDate = props.nextDueDate;
    this.administeredBy = props.administeredBy;
    this.lotNumber = props.lotNumber;
    this.manufacturer = props.manufacturer;
    this.notes = props.notes;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: VaccinationRecordProps): VaccinationRecord {
    return new VaccinationRecord(props);
  }

public update(updateData: Partial<Omit<VaccinationRecordProps, 'id' | 'createdAt' | 'patientId'>>): VaccinationRecord {
  return new VaccinationRecord({
    ...(this as VaccinationRecordProps),
    ...updateData,
    updatedAt: new Date(),
  } as VaccinationRecordProps);
}

  public isDue(): boolean {
    return new Date() >= this.nextDueDate;
  }

  public isOverdue(): boolean {
    const overdueDate = new Date(this.nextDueDate);
    overdueDate.setDate(overdueDate.getDate() + 30); 
    return new Date() > overdueDate;
  }
}