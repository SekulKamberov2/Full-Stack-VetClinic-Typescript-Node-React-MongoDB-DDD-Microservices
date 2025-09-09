import mongoose, { Document } from 'mongoose';
export interface PrescriptionDocument extends Document {
    recordId: string;
    medicationName: string;
    dosage: string;
    instructions?: string;
    datePrescribed: Date;
    refills: number;
    filledDate?: Date;
    filledBy?: string;
    status: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const PrescriptionModel: mongoose.Model<PrescriptionDocument, {}, {}, {}, mongoose.Document<unknown, {}, PrescriptionDocument> & PrescriptionDocument & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=PrescriptionModel.d.ts.map