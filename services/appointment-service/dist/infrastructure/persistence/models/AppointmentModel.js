"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppointmentModel = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const Appointment_1 = require("../../../domain/entities/Appointment");
const appointmentSchema = new mongoose_1.Schema({
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
        enum: Object.values(Appointment_1.AppointmentStatus),
        required: true,
        default: Appointment_1.AppointmentStatus.SCHEDULED,
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
appointmentSchema.virtual('endTime').get(function () {
    return new Date(this.appointmentDate.getTime() + this.duration * 60000);
});
appointmentSchema.statics.findByDateRange = function (startDate, endDate) {
    return this.find({
        appointmentDate: { $gte: startDate, $lte: endDate }
    }).sort({ appointmentDate: 1 }).exec();
};
appointmentSchema.statics.findByVeterinarianAndDateRange = function (veterinarianId, startDate, endDate) {
    return this.find({
        veterinarianId,
        appointmentDate: { $gte: startDate, $lte: endDate },
        status: {
            $in: [
                Appointment_1.AppointmentStatus.SCHEDULED,
                Appointment_1.AppointmentStatus.CONFIRMED,
                Appointment_1.AppointmentStatus.IN_PROGRESS
            ]
        }
    }).sort({ appointmentDate: 1 }).exec();
};
appointmentSchema.statics.findConflictingAppointments = function (veterinarianId, appointmentDate, duration) {
    const endTime = new Date(appointmentDate.getTime() + duration * 60000);
    return this.find({
        veterinarianId,
        status: {
            $in: [
                Appointment_1.AppointmentStatus.SCHEDULED,
                Appointment_1.AppointmentStatus.CONFIRMED,
                Appointment_1.AppointmentStatus.IN_PROGRESS
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
exports.AppointmentModel = mongoose_1.default.model('Appointment', appointmentSchema);
//# sourceMappingURL=AppointmentModel.js.map