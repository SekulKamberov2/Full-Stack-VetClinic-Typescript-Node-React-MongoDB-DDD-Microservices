import { Award } from "./Award";

export interface PetProps {
  _id?: string;
  name: string;
  species: string;
  breed: string;
  age: number;
  dateOfBirth: Date;
  weight: number;
  color: string;
  gender: 'Male' | 'Female';
  profileImage?: string;
  microchipNumber?: string | undefined;
  insuranceNumber?: string | undefined;
  medicalHistory: MedicalRecord[];
  dietaryRestrictions: string[];
  vaccinationRecords: VaccinationRecord[];
  awards: Award[]; 
  isActive: boolean;
  clientId: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface MedicalRecord {
  recordId: string;
  date: Date;
  condition: string;
  treatment: string;
  veterinarian: string;
  notes?: string | undefined;
  cost?: number | undefined;
}

export interface VaccinationRecord {
  vaccineId: string;
  vaccine: string;
  dateAdministered: Date;
  nextDueDate: Date;
  veterinarian: string;
  lotNumber?: string | undefined;
  isCompleted: boolean;
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

export class Pet {
  public readonly _id: string;
  public readonly name: string;
  public readonly species: string;
  public readonly breed: string;
  public readonly age: number;
  public readonly dateOfBirth: Date;
  public readonly weight: number;
  public readonly color: string;
  public readonly gender: 'Male' | 'Female';
  public readonly profileImage: string | undefined;
  public readonly microchipNumber: string | undefined;
  public readonly insuranceNumber: string | undefined;
  public readonly medicalHistory: MedicalRecord[];
  public readonly dietaryRestrictions: string[];
  public readonly vaccinationRecords: VaccinationRecord[];
  public readonly awards: Award[];
  public readonly isActive: boolean;
  public readonly clientId: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  private constructor(props: PetProps) {
    this._id = props._id || "";
    this.name = props.name;
    this.species = props.species;
    this.breed = props.breed;
    this.age = props.age;
    this.dateOfBirth = props.dateOfBirth;
    this.weight = props.weight;
    this.color = props.color;
    this.gender = props.gender;
    this.profileImage = props.profileImage;
    this.microchipNumber = props.microchipNumber;
    this.insuranceNumber = props.insuranceNumber;
    this.medicalHistory = props.medicalHistory || [];
    this.dietaryRestrictions = props.dietaryRestrictions || [];
    this.vaccinationRecords = props.vaccinationRecords || [];
    this.awards = props.awards || [];
    this.isActive = props.isActive ?? true;
    this.clientId = props.clientId;
    this.createdAt = props.createdAt || new Date();
    this.updatedAt = props.updatedAt || new Date();
  }

  public static create(props: PetProps): Pet {
    const pet = new Pet(props);
    return pet;
  }

  public update(props: Partial<Omit<PetProps, '_id' | 'createdAt' | 'clientId'>>): Pet {
    return new Pet({
      ...(this as PetProps),
      ...props,
      updatedAt: new Date(),
    });
  }

  public addMedicalRecord(record: MedicalRecord): Pet {
    const updatedMedicalHistory = [...this.medicalHistory, record];
    return new Pet({
      ...(this as PetProps),
      medicalHistory: updatedMedicalHistory,
      updatedAt: new Date(),
    });
  }

  public addVaccinationRecord(record: VaccinationRecord): Pet {
    const updatedVaccinations = [...this.vaccinationRecords, record];
    return new Pet({
      ...(this as PetProps),
      vaccinationRecords: updatedVaccinations,
      updatedAt: new Date(),
    });
  }

  public updateProfileImage(profileImage: string): Pet {
    return new Pet({
      ...(this as PetProps),
      profileImage,
      updatedAt: new Date(),
    });
  }

  public completeVaccination(vaccineId: string): Pet {
    const updatedVaccinations = this.vaccinationRecords.map(record =>
      record.vaccineId === vaccineId 
        ? { ...record, isCompleted: true }
        : record
    );
    return new Pet({
      ...(this as PetProps),
      vaccinationRecords: updatedVaccinations,
      updatedAt: new Date(),
    });
  }

  public addAward(award: Award): Pet {
    const updatedAwards = [...this.awards, award];
    return new Pet({
      ...(this as PetProps), 
      awards: updatedAwards,
      updatedAt: new Date(),
    });
  }

  public removeAward(awardId: string): Pet {
    const updatedAwards = this.awards.filter(award => award._id !== awardId);
    return new Pet({
      ...(this as PetProps), 
      awards: updatedAwards,
      updatedAt: new Date(),
    });
  }

  public getAwardsByCategory(category: AwardCategory): Award[] {
    return this.awards.filter(award => award.category === category);
  }

  public getTotalAwardPoints(): number {
    return this.awards.reduce((total, award) => total + award.points, 0);
  }

  public deactivate(): Pet {
    return new Pet({
      ...(this as PetProps),
      isActive: false,
      updatedAt: new Date(),
    });
  }

  public activate(): Pet {
    return new Pet({
      ...(this as PetProps),
      isActive: true,
      updatedAt: new Date(),
    });
  }
}
