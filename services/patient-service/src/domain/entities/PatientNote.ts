export interface PatientNoteProps {
  id?: string;
  patientId: string;
  weight: number;
  noteText: string;
  authorId: string;
  dateCreated: Date;
  noteType: NoteType;
  createdAt?: Date;
  updatedAt?: Date;
}

export enum NoteType {
  GENERAL = 'general',
  BEHAVIORAL = 'behavioral',
  DIETARY = 'dietary',
  OWNER_INSTRUCTIONS = 'owner_instructions'
}

export class PatientNote {
  public readonly id: string;
  public readonly patientId: string;
  public readonly weight: number;
  public readonly noteText: string;
  public readonly authorId: string;
  public readonly dateCreated: Date;
  public readonly noteType: NoteType;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: PatientNoteProps) {
    this.id = props.id || "";
    this.patientId = props.patientId;
    this.weight = props.weight;
    this.noteText = props.noteText;
    this.authorId = props.authorId;
    this.dateCreated = props.dateCreated;
    this.noteType = props.noteType;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: PatientNoteProps): PatientNote {
    return new PatientNote(props);
  }

  public update(updateData: Partial<Omit<PatientNoteProps, 'id' | 'createdAt' | 'patientId' | 'authorId'>>): PatientNote {
    return new PatientNote({
      ...this,
      ...updateData,
      updatedAt: new Date(),
    });
  }

  public updateWeight(weight: number): PatientNote {
    return new PatientNote({
      ...this,
      weight,
      updatedAt: new Date(),
    });
  }
}
