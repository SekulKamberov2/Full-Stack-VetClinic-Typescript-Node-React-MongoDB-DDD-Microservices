import mongoose, { Schema, Document, Model } from 'mongoose';
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
  findByVeterinarianAndDateRange(
    veterinarianId: string, 
    startDate: Date, 
    endDate: Date
  ): Promise<AppointmentDocument[]>;
  findConflictingAppointments(
    veterinarianId: string,
    appointmentDate: Date,
    duration: number
  ): Promise<AppointmentDocument[]>;
}

const appointmentSchema = new Schema<AppointmentDocument, AppointmentModel>({
  clientId: { 
    type: String, 
    required: true,
    index: true 
  },
  patientId: { 
    type: String, 
    required: true,
    index: true 
  },
  veterinarianId: { 
    type: String, 
    required: true,
    index: true 
  },
  appointmentDate: { 
    type: Date, 
    required: true,
    index: true 
  },
  duration: { 
    type: Number, 
    required: true,
    min: 5,
    max: 480
  },
  status: { 
    type: String, 
    enum: Object.values(AppointmentStatus),
    required: true,
    default: AppointmentStatus.SCHEDULED,
    index: true
  },
  reason: { 
    type: String, 
    required: true,
    maxlength: 500
  },
  notes: { 
    type: String, 
    maxlength: 1000
  },
  cancelledBy: { 
    type: String 
  },
  cancellationReason: { 
    type: String,
    maxlength: 500
  },
  confirmedBy: { 
    type: String 
  },
  completedBy: { 
    type: String 
  },
  completedNotes: { 
    type: String,
    maxlength: 1000
  },
  startedBy: { 
    type: String 
  }
}, {
  timestamps: true
});

appointmentSchema.index({ veterinarianId: 1, appointmentDate: 1 });
appointmentSchema.index({ clientId: 1, appointmentDate: 1 });
appointmentSchema.index({ status: 1, appointmentDate: 1 });

appointmentSchema.virtual('endTime').get(function(this: AppointmentDocument) {
  return new Date(this.appointmentDate.getTime() + this.duration * 60000);
});

appointmentSchema.statics.findByDateRange = function(
  startDate: Date, 
  endDate: Date
): Promise<AppointmentDocument[]> {
  return this.find({
    appointmentDate: { $gte: startDate, $lte: endDate }
  }).sort({ appointmentDate: 1 }).exec();
};

appointmentSchema.statics.findByVeterinarianAndDateRange = function(
  veterinarianId: string,
  startDate: Date, 
  endDate: Date
): Promise<AppointmentDocument[]> {
  return this.find({
    veterinarianId,
    appointmentDate: { $gte: startDate, $lte: endDate },
    status: { 
      $in: [
        AppointmentStatus.SCHEDULED, 
        AppointmentStatus.CONFIRMED, 
        AppointmentStatus.IN_PROGRESS
      ] 
    }
  }).sort({ appointmentDate: 1 }).exec();
};

appointmentSchema.statics.findConflictingAppointments = function(
  veterinarianId: string,
  appointmentDate: Date,
  duration: number
): Promise<AppointmentDocument[]> {
  const endTime = new Date(appointmentDate.getTime() + duration * 60000);
  
  return this.find({
    veterinarianId,
    status: { 
      $in: [
        AppointmentStatus.SCHEDULED, 
        AppointmentStatus.CONFIRMED, 
        AppointmentStatus.IN_PROGRESS
      ] 
    },
    $or: [
      {
        appointmentDate: { $lte: appointmentDate },
        endTime: { $gt: appointmentDate }
      },
      {
        appointmentDate: { $lt: endTime },
        endTime: { $gte: endTime }
      },
      {
        appointmentDate: { $gte: appointmentDate },
        endTime: { $lte: endTime }
      }
    ]
  }).exec();
};

appointmentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => { 
    ret.id = ret._id.toString(); 
    delete ret._id; 
  }
});

export const AppointmentModel = mongoose.model<AppointmentDocument, AppointmentModel>(
  'Appointment', 
  appointmentSchema
);
