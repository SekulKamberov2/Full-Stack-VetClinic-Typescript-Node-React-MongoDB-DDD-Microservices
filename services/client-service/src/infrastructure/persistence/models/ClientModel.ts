import mongoose, { Schema, Document } from 'mongoose';

export interface IClientDocument extends Document {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  profileImage?: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  pets: mongoose.Types.ObjectId[]; 
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  zipCode: { type: String, required: true },
  country: { type: String, required: true, default: 'USA' },
});

const ClientSchema = new Schema<IClientDocument>(
  {
    firstName: { 
      type: String, 
      required: true, 
      trim: true,
      index: true 
    },
    lastName: { 
      type: String, 
      required: true, 
      trim: true,
      index: true 
    },
    email: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true, 
      trim: true,
      index: true 
    },
    phone: { 
      type: String, 
      required: true, 
      trim: true 
    },
    profileImage: { 
      type: String,
      default: null 
    },
    address: { 
      type: AddressSchema, 
      required: true 
    },
    pets: [{ type: Schema.Types.ObjectId, ref: 'Pet' }],
    isActive: { 
      type: Boolean, 
      default: true,
      index: true 
    },
  },
  {
    timestamps: true, 
  }
);

ClientSchema.index({ pets: 1 });
ClientSchema.index({ firstName: 1, lastName: 1 });
ClientSchema.index({ isActive: 1, createdAt: -1 });
ClientSchema.index({ 'address.state': 1, isActive: 1 });

ClientSchema.index({ firstName: 'text', lastName: 'text', email: 'text', phone: 'text'});

export const ClientModel = mongoose.model<IClientDocument>('Client', ClientSchema);
