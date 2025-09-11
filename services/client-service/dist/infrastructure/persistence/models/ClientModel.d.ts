import mongoose, { Document } from 'mongoose';
export interface IClientDocument extends Document {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
        country: string;
    };
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export declare const ClientModel: mongoose.Model<IClientDocument, {}, {}, {}, mongoose.Document<unknown, {}, IClientDocument> & IClientDocument & {
    _id: mongoose.Types.ObjectId;
}, any>;
