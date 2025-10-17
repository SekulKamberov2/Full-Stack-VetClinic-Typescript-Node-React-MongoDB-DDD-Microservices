import { Patient } from '../../../domain/entities/Patient';
import { Allergy } from '../../../domain/entities/Allergy';
import { MedicalAlert } from '../../../domain/entities/MedicalAlert';
import { PatientNote } from '../../../domain/entities/PatientNote';
import { VaccinationRecord } from '../../../domain/entities/VaccinationRecord';
import { Visit } from '../../../domain/entities/Visit';
import { PatientRepository } from '../../../domain/repositories/PatientRepository';
import { AllergyRepository } from '../../../domain/repositories/AllergyRepository';
import { MedicalAlertRepository } from '../../../domain/repositories/MedicalAlertRepository';
import { PatientNoteRepository } from '../../../domain/repositories/PatientNoteRepository';
import { VaccinationRecordRepository } from '../../../domain/repositories/VaccinationRecordRepository';
import { VisitRepository } from '../../../domain/repositories/VisitRepository';
import { ErrorHandler } from "@vetclinic/shared-kernel";

export interface PatientWithDetails {
  patient: Patient;
  allergies: Allergy[];
  medicalAlerts: MedicalAlert[];
  patientNotes: PatientNote[];
  vaccinationRecords: VaccinationRecord[];
  visits: Visit[];
}

export class GetPatientWithDetailsByOwnerUseCase {
  constructor(
    private patientRepository: PatientRepository,
    private allergyRepository: AllergyRepository,
    private medicalAlertRepository: MedicalAlertRepository,
    private patientNoteRepository: PatientNoteRepository,
    private vaccinationRecordRepository: VaccinationRecordRepository,
    private visitRepository: VisitRepository
  ) {}

  async execute(ownerId: string, patientId: string): Promise<PatientWithDetails> {
    try {
      const patient = await this.patientRepository.findById(patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }
      
      if (patient.ownerId !== ownerId) {
        throw new Error('Patient does not belong to the specified owner');
      }

      const [
        allergies,
        medicalAlerts,
        patientNotes,
        vaccinationRecords,
        visits
      ] = await Promise.all([
        this.allergyRepository.findByPatientId(patientId),
        this.medicalAlertRepository.findByPatientId(patientId),
        this.patientNoteRepository.findByPatientId(patientId),
        this.vaccinationRecordRepository.findByPatientId(patientId),
        this.visitRepository.findByPatientId(patientId)
      ]);

      return {
        patient,
        allergies,
        medicalAlerts,
        patientNotes,
        vaccinationRecords,
        visits
      };
    } catch (error) {
      return ErrorHandler.handleAppError(error, 'Get patient with details by owner') as never;
    }
  }
}
