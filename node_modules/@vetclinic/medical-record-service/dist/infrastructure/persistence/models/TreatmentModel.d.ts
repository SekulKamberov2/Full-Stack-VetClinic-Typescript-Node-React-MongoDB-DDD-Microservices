import mongoose, { Document } from 'mongoose';
export interface TreatmentDocument extends Document {
    recordId: string;
    name: string;
    description: string;
    date: Date;
    cost: number;
    createdAt: Date;
    updatedAt: Date;
}
export declare const TreatmentModel: mongoose.Model<TreatmentDocument, {}, {}, {}, mongoose.Document<unknown, {}, TreatmentDocument> & TreatmentDocument & {
    _id: mongoose.Types.ObjectId;
}, any>;
//# sourceMappingURL=TreatmentModel.d.ts.map