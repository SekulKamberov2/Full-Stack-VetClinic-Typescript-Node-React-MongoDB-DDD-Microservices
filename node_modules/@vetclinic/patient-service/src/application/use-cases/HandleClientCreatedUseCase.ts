import { PatientRepository } from '../../domain/repositories/PatientRepository';

export class HandleClientCreatedUseCase {
  constructor(private patientRepository: PatientRepository) {}

  async execute(event: any): Promise<void> {
    console.log('Received client created event:', event);
    // here must havedefault patient records or other actions
    // when a new client is created
  }
}