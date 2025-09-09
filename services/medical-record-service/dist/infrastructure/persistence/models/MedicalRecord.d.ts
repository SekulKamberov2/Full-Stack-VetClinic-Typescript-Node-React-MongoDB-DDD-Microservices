import mongoose, { Document } from 'mongoose';
export interface MedicalRecordDocument extends Document {
    patientId: string;
    clientId: string;
    veterinarianId: string;
    appointmentId?: string;
    notes?: string;
    diagnoses: mongoose.Types.ObjectId[];
    treatments: mongoose.Types.ObjectId[];
    prescriptions: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}
export declare const MedicalRecordModel: mongoose.Model<MedicalRecordDocument, {}, {}, {}, mongoose.Document<unknown, {}, MedicalRecordDocument> & MedicalRecordDocument & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=MedicalRecord.d.ts.map