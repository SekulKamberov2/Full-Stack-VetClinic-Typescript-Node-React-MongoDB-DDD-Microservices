import { Document, Model } from 'mongoose';
import { AppointmentStatus } from '../../../domain/entities/Appointment';
export interface AppointmentDocument extends Document {
    clientId: string;
    patientId: string;
    veterinarianId: string;
    appointmentDate: Date;
    duration: number;
    status: AppointmentStatus;
    reason: string;
    notes?: string;
    cancelledBy?: string;
    cancellationReason?: string;
    confirmedBy?: string;
    completedBy?: string;
    completedNotes?: string;
    startedBy?: string;
    createdAt: Date;
    updatedAt: Date;
}
interface AppointmentModel extends Model<AppointmentDocument> {
    findByDateRange(startDate: Date, endDate: Date): Promise<AppointmentDocument[]>;
    findByVeterinarianAndDateRange(veterinarianId: string, startDate: Date, endDate: Date): Promise<AppointmentDocument[]>;
    findConflictingAppointments(veterinarianId: string, appointmentDate: Date, duration: number): Promise<AppointmentDocument[]>;
}
export declare const AppointmentModel: AppointmentModel;
export {};
//# sourceMappingURL=AppointmentModel.d.ts.map