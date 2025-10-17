import { MedicalAlert, MedicalAlertProps, AlertSeverity } from '../../domain/entities/MedicalAlert';
import { MedicalAlertRepository } from '../../domain/repositories/MedicalAlertRepository';
import { MedicalAlertModel } from './models/MedicalAlertModel';
import { AppError, ValidationError, NotFoundError } from '@vetclinic/shared-kernel';

export class MongoMedicalAlertRepository implements MedicalAlertRepository {
  private model: typeof MedicalAlertModel;

  constructor() {
    this.model = MedicalAlertModel;
  }

  async findById(id: string): Promise<MedicalAlert | null> {
    try {
      const alertDoc = await this.model.findById(id).exec();
      return alertDoc ? this.toEntity(alertDoc) : null;
    } catch (error) {
      this.handleDatabaseError(error, 'findById');
    }
  }

  async findByPatientId(patientId: string): Promise<MedicalAlert[]> {
    try {
      const alertDocs = await this.model.find({ patientId }).sort({ dateCreated: -1 }).exec();
      return alertDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findByPatientId');
    }
  }

  async findAll(): Promise<MedicalAlert[]> {
    try {
      const alertDocs = await this.model.find().exec();
      return alertDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findAll');
    }
  }

  async findActiveByPatientId(patientId: string): Promise<MedicalAlert[]> {
    try {
      const alertDocs = await this.model.find({ patientId, isActive: true }).sort({ dateCreated: -1 }).exec();
      return alertDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findActiveByPatientId');
    }
  }

  async findBySeverity(severity: string): Promise<MedicalAlert[]> {
    try {
      const alertDocs = await this.model.find({ severity, isActive: true }).exec();
      return alertDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findBySeverity');
    }
  }

  async findCriticalAlerts(): Promise<MedicalAlert[]> {
    try {
      const alertDocs = await this.model.find({ 
        severity: 'critical', 
        isActive: true 
      }).sort({ dateCreated: -1 }).exec();
      return alertDocs.map(doc => this.toEntity(doc));
    } catch (error) {
      this.handleDatabaseError(error, 'findCriticalAlerts');
    }
  }

  async save(alert: MedicalAlert): Promise<MedicalAlert> {
    try {
      if (!alert.id || alert.id === '') {
        const alertDoc = new this.model(this.toDocument(alert));
        const savedDoc = await alertDoc.save();
        return this.toEntity(savedDoc);
      }
      
      const updatedDoc = await this.model.findByIdAndUpdate(
        alert.id,
        this.toDocument(alert),
        { new: true, runValidators: true }
      ).exec();
      
      if (!updatedDoc) {
        throw new NotFoundError(
          `Medical alert with ID ${alert.id} not found`,
          undefined,
          'MedicalAlertRepository'
        );
      }
      return this.toEntity(updatedDoc);
    } catch (error) {
      this.handleDatabaseError(error, 'save');
    }
  }

  async update(alert: MedicalAlert): Promise<void> {
    try {
      const result = await this.model.findByIdAndUpdate(
        alert.id,
        this.toDocument(alert),
        { new: true, runValidators: true }
      ).exec();
      
      if (!result) {
        throw new NotFoundError(
          `Medical alert with ID ${alert.id} not found`,
          undefined,
          'MedicalAlertRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'update');
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const result = await this.model.findByIdAndDelete(id).exec();
      if (!result) {
        throw new NotFoundError(
          `Medical alert with ID ${id} not found`,
          undefined,
          'MedicalAlertRepository'
        );
      }
    } catch (error) {
      this.handleDatabaseError(error, 'delete');
    }
  }

private toEntity(doc: any): MedicalAlert {
  const props: MedicalAlertProps = {
    id: doc._id.toString(),
    patientId: doc.patientId,
    alertText: doc.alertText,
    severity: doc.severity as AlertSeverity,
    createdBy: doc.createdBy,
    dateCreated: doc.dateCreated,
    isActive: doc.isActive,
    notes: doc.notes,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
  return MedicalAlert.create(props);  
}

  private toDocument(alert: MedicalAlert): Partial<any> {
    return {
      patientId: alert.patientId,
      alertText: alert.alertText,
      severity: alert.severity,
      createdBy: alert.createdBy,
      dateCreated: alert.dateCreated,
      isActive: alert.isActive,
      notes: alert.notes,
      updatedAt: new Date()
    };
  }

  private handleDatabaseError(error: unknown, operation: string): never {
    const context = `MongoMedicalAlertRepository.${operation}`;
    
    if (AppError.isAppError(error)) {
      throw error;
    }
    
    if (error instanceof Error && error.name === 'ValidationError') {
      throw new ValidationError(
        `Database validation failed: ${error.message}`,
        error,
        context
      );
    }
    
    if (error instanceof Error && error.name === 'CastError') {
      throw new ValidationError(
        'Invalid ID format',
        error,
        context
      );
    }
    
    throw new AppError(
      `Database operation failed: ${operation}`,
      'DATABASE_OPERATION_FAILED',
      error,
      context
    );
  }
}
