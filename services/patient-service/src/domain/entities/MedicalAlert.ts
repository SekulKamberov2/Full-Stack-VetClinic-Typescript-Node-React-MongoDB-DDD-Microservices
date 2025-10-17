export interface MedicalAlertProps {
  id?: string;
  patientId: string;
  alertText: string;
  severity: AlertSeverity;
  createdBy: string;
  dateCreated: Date;
  isActive: boolean;
  notes?: string | undefined;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum AlertSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export class MedicalAlert {
  public readonly id: string;
  public readonly patientId: string;
  public readonly alertText: string;
  public readonly severity: AlertSeverity;
  public readonly createdBy: string;
  public readonly dateCreated: Date;
  public readonly isActive: boolean;
  public readonly notes?: string | undefined; 
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: MedicalAlertProps) {
    this.id = props.id || "";
    this.patientId = props.patientId;
    this.alertText = props.alertText;
    this.severity = props.severity;
    this.createdBy = props.createdBy;
    this.dateCreated = props.dateCreated;
    this.isActive = props.isActive;
    this.notes = props.notes; 
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: MedicalAlertProps): MedicalAlert {
    return new MedicalAlert(props);
  }
public update(updateData: Partial<Omit<MedicalAlertProps, 'id' | 'createdAt' | 'patientId' | 'createdBy'>>): MedicalAlert {
    return new MedicalAlert({
      ...this,
      ...updateData,
      updatedAt: new Date(),
    });
  }

  public updateSeverity(severity: AlertSeverity): MedicalAlert {
    return new MedicalAlert({
      ...this,
      severity,
      updatedAt: new Date(),
    });
  }

  public deactivate(): MedicalAlert {
    return new MedicalAlert({
      ...this,
      isActive: false,
      updatedAt: new Date(),
    });
  }

  public activate(): MedicalAlert {
    return new MedicalAlert({
      ...this,
      isActive: true,
      updatedAt: new Date(),
    });
  } 
}
