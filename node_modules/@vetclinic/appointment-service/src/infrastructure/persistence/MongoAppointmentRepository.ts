import { Appointment, AppointmentProps, AppointmentStatus } from '../../domain/entities/Appointment';
import { AppointmentRepository } from '../../domain/repositories/AppointmentRepository';
import mongoose, { Schema, Model } from 'mongoose';

interface AppointmentDocument extends mongoose.Document {
  clientId: string;
  patientId: string;
  veterinarianId: string;
  appointmentDate: Date;
  duration: number;
  status: AppointmentStatus;
  reason: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const appointmentSchema = new Schema<AppointmentDocument>({
  clientId: { type: String, required: true },
  patientId: { type: String, required: true },
  veterinarianId: { type: String, required: true },
  appointmentDate: { type: Date, required: true },
  duration: { type: Number, required: true },
  status: { 
    type: String, 
    enum: Object.values(AppointmentStatus),
    required: true 
  },
  reason: { type: String, required: true },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export class MongoAppointmentRepository implements AppointmentRepository {
  private model: Model<AppointmentDocument>;

  constructor() {
    this.model = mongoose.model<AppointmentDocument>('Appointment', appointmentSchema);
  }

  async findById(id: string): Promise<Appointment | null> {
    try { 
      const appointmentDoc = await this.model.findById(id).exec();
      return appointmentDoc ? this.toEntity(appointmentDoc) : null;
    } catch (error) { 
      const appointmentDoc = await this.model.findOne({ _id: id }).exec();
      return appointmentDoc ? this.toEntity(appointmentDoc) : null;
    }
  }

  async findByClientId(clientId: string): Promise<Appointment[]> {
    const appointmentDocs = await this.model.find({ clientId }).exec();
    return appointmentDocs.map(doc => this.toEntity(doc));
  }

  async findByVeterinarianId(veterinarianId: string): Promise<Appointment[]> {
    const appointmentDocs = await this.model.find({ veterinarianId }).exec();
    return appointmentDocs.map(doc => this.toEntity(doc));
  }

  async findByDateRange(startDate: Date, endDate: Date): Promise<Appointment[]> {
    const appointmentDocs = await this.model.find({
      appointmentDate: { $gte: startDate, $lte: endDate }
    }).exec();
    return appointmentDocs.map(doc => this.toEntity(doc));
  }

  async findByVeterinarianIdAndDateRange(
    veterinarianId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<Appointment[]> {
    const appointmentDocs = await this.model.find({
      veterinarianId,
      $or: [
        { appointmentDate: { $gte: startDate, $lte: endDate } },
        { 
          $expr: {
            $lte: [
              { $add: ["$appointmentDate", { $multiply: ["$duration", 60000] }] },
              endDate
            ]
          }
        },
        {
          $expr: {
            $and: [
              { $lte: ["$appointmentDate", startDate] },
              { $gte: [
                { $add: ["$appointmentDate", { $multiply: ["$duration", 60000] }] },
                endDate
              ]}
            ]
          }
        }
      ],
      status: { 
        $in: [
          AppointmentStatus.SCHEDULED, 
          AppointmentStatus.CONFIRMED, 
          AppointmentStatus.IN_PROGRESS
        ] 
      }
    }).exec();
    
    return appointmentDocs.map(doc => this.toEntity(doc));
  } 

  async save(appointment: Appointment): Promise<Appointment> { 
  if (!appointment.id || appointment.id === '') {
    const appointmentDoc = new this.model(this.toDocument(appointment));
    await appointmentDoc.save(); 
    return this.toEntity(appointmentDoc);
  }
   
  const updatedDoc = await this.model.findByIdAndUpdate(
    appointment.id,
    this.toDocument(appointment),
    { new: true, runValidators: true }
  ).exec();
  
  if (!updatedDoc) {
    throw new Error('Failed to update appointment');
  }
  return this.toEntity(updatedDoc);
}

  async update(appointment: Appointment): Promise<void> {
    await this.model.findByIdAndUpdate(
      appointment.id, 
      this.toDocument(appointment), 
      { new: true }
    );
  }

  async delete(id: string): Promise<void> {
    await this.model.findByIdAndDelete(id).exec();
  }

  async exists(id: string): Promise<boolean> {
    const count = await this.model.countDocuments({ _id: id }).exec();
    return count > 0;
  }

  private toEntity(doc: any): Appointment {
    const props: AppointmentProps = {
      id: doc._id.toString(),
      clientId: doc.clientId,
      patientId: doc.patientId,
      veterinarianId: doc.veterinarianId,
      appointmentDate: doc.appointmentDate,
      duration: doc.duration,
      status: doc.status as AppointmentStatus,
      reason: doc.reason,
      notes: doc.notes,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt
    };
    return Appointment.create(props);
  }

  private toDocument(appointment: Appointment): any { 
  return {   
    clientId: appointment.clientId,
    patientId: appointment.patientId,
    veterinarianId: appointment.veterinarianId,
    appointmentDate: appointment.appointmentDate,
    duration: appointment.duration,
    status: appointment.status,
    reason: appointment.reason,
    notes: appointment.notes,
    updatedAt: new Date()
  };
}
}