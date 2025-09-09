import mongoose, { Document } from 'mongoose';
export interface DiagnosisDocument extends Document {
    recordId: string;
    description: string;
    date: Date;
    notes?: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const DiagnosisModel: mongoose.Model<DiagnosisDocument, {}, {}, {}, mongoose.Document<unknown, {}, DiagnosisDocument> & DiagnosisDocument & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=DiagnosisModel.d.ts.map