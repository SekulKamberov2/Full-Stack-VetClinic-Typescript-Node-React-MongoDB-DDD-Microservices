export interface PatientProps {
  id?: string;
  name: string;
  species: string;
  breed: string;
  dateOfBirth: Date;
  color: string;
  sex: string;
  microchipNumber?: string  | "";
  profilePictureUrl?: string | "";
  status: PatientStatus;
  ownerId: string;
  medicalAlerts: string[];
  isActive?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum PatientStatus {
  ACTIVE = 'active',
  DECEASED = 'deceased',
  TRANSFERRED = 'transferred'
}

export class Patient {
  public readonly id: string;
  public readonly name: string;
  public readonly species: string;
  public readonly breed: string;
  public readonly dateOfBirth: Date;
  public readonly color: string;
  public readonly sex: string;
  public readonly microchipNumber?: string;
  public readonly profilePictureUrl?: string;
  public readonly status: PatientStatus;
  public readonly ownerId: string;
  public readonly medicalAlerts: string[];
  public readonly isActive: boolean;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: PatientProps) {
    this.id = props.id || "";
    this.name = props.name;
    this.species = props.species;
    this.breed = props.breed;
    this.dateOfBirth = props.dateOfBirth;
    this.color = props.color;
    this.sex = props.sex;
    this.microchipNumber = props.microchipNumber  || "";
    this.profilePictureUrl = props.profilePictureUrl  || "";
    this.status = props.status;
    this.ownerId = props.ownerId;
    this.medicalAlerts = props.medicalAlerts || [];
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

  public updateMedicalAlerts(alerts: string[]): Patient {
    return new Patient({
      ...this,
      medicalAlerts: alerts,
      updatedAt: new Date(),
    });
  }

  public updateStatus(status: PatientStatus): Patient {
    return new Patient({
      ...this,
      status,
      updatedAt: new Date(),
    });
  }

  public updateProfilePicture(url: string): Patient {
    return new Patient({
      ...this,
      profilePictureUrl: url,
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

  public activate(): Patient {
    return new Patient({
      ...this,
      isActive: true,
      updatedAt: new Date(),
    });
  }

  public transfer(newOwnerId: string): Patient {
    return new Patient({
      ...this,
      ownerId: newOwnerId,
      status: PatientStatus.TRANSFERRED,
      updatedAt: new Date(),
    });
  }
}
