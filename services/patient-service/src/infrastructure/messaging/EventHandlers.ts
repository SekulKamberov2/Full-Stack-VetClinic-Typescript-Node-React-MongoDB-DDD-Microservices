import { UpdateVisitUseCase } from '../../application/use-cases/Visits/UpdateVisitUseCase';
import { UpdateAllergyUseCase } from '../../application/use-cases/Allergies/UpdateAllergyUseCase';
import { UpdateVaccinationUseCase } from '../../application/use-cases/Vaccinations/UpdateVaccinationUseCase';
import { UpdatePatientNoteUseCase } from '../../application/use-cases/PatientNotes/UpdatePatientNoteUseCase';

export class EventHandlers {
  constructor(
    private updateVisitUseCase: UpdateVisitUseCase,
    private updateAllergyUseCase: UpdateAllergyUseCase,
    private updateVaccinationUseCase: UpdateVaccinationUseCase,
    private updatePatientNoteUseCase: UpdatePatientNoteUseCase
  ) {}

  async handleVisitUpdatedEvent(event: any): Promise<void> {
    try {
      await this.updateVisitUseCase.execute(event.visitId, event.visitData);
      console.log(`Visit ${event.visitId} updated successfully`);
    } catch (error) {
      console.error('Error handling VisitUpdated event:', error);
    }
  }

  async handleAllergyUpdatedEvent(event: any): Promise<void> {
    try {
      await this.updateAllergyUseCase.execute(event.allergyId, event.allergyData);
      console.log(`Allergy ${event.allergyId} updated successfully`);
    } catch (error) {
      console.error('Error handling AllergyUpdated event:', error);
    }
  }

  async handleVaccinationUpdatedEvent(event: any): Promise<void> {
    try {
      await this.updateVaccinationUseCase.execute(event.vaccinationId, event.vaccinationData);
      console.log(`Vaccination ${event.vaccinationId} updated successfully`);
    } catch (error) {
      console.error('Error handling VaccinationUpdated event:', error);
    }
  }

  async handlePatientNoteUpdatedEvent(event: any): Promise<void> {
    try {
      await this.updatePatientNoteUseCase.execute(event.noteId, event.noteData);
      console.log(`Patient note ${event.noteId} updated successfully`);
    } catch (error) {
      console.error('Error handling PatientNoteUpdated event:', error);
    }
  }
}