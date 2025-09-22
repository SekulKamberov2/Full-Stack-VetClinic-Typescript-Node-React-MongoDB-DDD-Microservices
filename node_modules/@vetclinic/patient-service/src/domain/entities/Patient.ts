export interface PatientProps {
  id?: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  medicalAlerts: string[];
  ownerId: string;
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export class Patient {
  public readonly id: string;
  public readonly name: string;
  public readonly species: string;
  public readonly breed: string;
  public readonly dateOfBirth: Date;
  public readonly medicalAlerts: string[];
  public readonly ownerId: string;
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: PatientProps) {
    this.id = props.id || "";
    this.name = props.name;
    this.species = props.species;
    this.breed = props.breed;
    this.dateOfBirth = props.dateOfBirth;
    this.medicalAlerts = props.medicalAlerts || [];
    this.ownerId = props.ownerId;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: PatientProps): Patient {
    return new Patient(props);
  }

  public update(updateData: Partial<Omit<PatientProps, 'id' | 'createdAt' | 'ownerId'>>): Patient {
    return new Patient({
      ...this,
      ...updateData,
      updatedAt: new Date(),
    });
  }

  public partialUpdate(updateData: Partial<Omit<PatientProps, 'id' | 'createdAt' | 'ownerId'>>): Patient {
    return new Patient({
      id: this.id,
      name: updateData.name ?? this.name,
      species: updateData.species ?? this.species,
      breed: updateData.breed ?? this.breed,
      dateOfBirth: updateData.dateOfBirth ?? this.dateOfBirth,
      medicalAlerts: updateData.medicalAlerts ?? this.medicalAlerts,
      ownerId: this.ownerId,
      isActive: updateData.isActive ?? this.isActive,
      createdAt: this.createdAt,
      updatedAt: new Date(),
    });
  }


  public updateMedicalAlerts(alerts: string[]): Patient {
    return new Patient({
      ...this,
      medicalAlerts: alerts,
      updatedAt: new Date(),
    });
  }

  public deactivate(): Patient {
    return new Patient({
      ...this,
      isActive: false,
      updatedAt: new Date(),
    });
  }
}