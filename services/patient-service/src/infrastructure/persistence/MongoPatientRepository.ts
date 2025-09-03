import { Patient, PatientProps } from '../../domain/entities/Patient';
import { PatientRepository } from '../../domain/repositories/PatientRepository';
import { PatientModel } from './models/PatientModel';

export class MongoPatientRepository implements PatientRepository {
  async findById(id: string): Promise<Patient | null> {
    const patientDoc = await PatientModel.findById(id).exec();
    return patientDoc ? this.toEntity(patientDoc) : null;
  }

  async findByOwnerId(ownerId: string): Promise<Patient[]> {
    const patientDocs = await PatientModel.find({ ownerId, isActive: true }).exec();
    return patientDocs.map(doc => this.toEntity(doc));
  }

  async findAll(): Promise<Patient[]> {
    const patientDocs = await PatientModel.find({ isActive: true }).exec();
    return patientDocs.map(doc => this.toEntity(doc));
  }

  async save(patient: Patient): Promise<Patient> {    
    const patientDoc = new PatientModel(this.toDocument(patient));
    const saved = await patientDoc.save(); 
    return this.toEntity(saved);
  }

  async update(patient: Patient): Promise<void> {
    await PatientModel.findByIdAndUpdate(patient.id, this.toDocument(patient));
  }

  async delete(id: string): Promise<void> {
    await PatientModel.findByIdAndUpdate(id, { isActive: false });
  }

  private toEntity(doc: any): Patient {
    const props: PatientProps = {
      id: doc._id.toString(),
      name: doc.name,
      species: doc.species,
      breed: doc.breed,
      dateOfBirth: doc.dateOfBirth,
      medicalAlerts: doc.medicalAlerts,
      ownerId: doc.ownerId,
      isActive: doc.isActive,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
    return Patient.create(props);  
  }

  private toDocument(patient: Patient): any { 
    return {
      name: patient.name,
      species: patient.species,
      breed: patient.breed,
      dateOfBirth: patient.dateOfBirth,
      medicalAlerts: patient.medicalAlerts,
      ownerId: patient.ownerId,
      isActive: patient.isActive,
      createdAt: patient.createdAt,
      updatedAt: patient.updatedAt,
    };
  }
}