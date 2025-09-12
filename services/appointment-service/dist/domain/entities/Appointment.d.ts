export interface AppointmentProps {
    id?: string;
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
    createdAt?: Date;
    updatedAt?: Date;
}
export declare enum AppointmentStatus {
    SCHEDULED = "SCHEDULED",
    CONFIRMED = "CONFIRMED",
    IN_PROGRESS = "IN_PROGRESS",
    COMPLETED = "COMPLETED",
    CANCELLED = "CANCELLED",
    NO_SHOW = "NO_SHOW"
}
export declare class Appointment {
    readonly id: string;
    readonly clientId: string;
    readonly patientId: string;
    readonly veterinarianId: string;
    readonly appointmentDate: Date;
    readonly duration: number;
    readonly status: AppointmentStatus;
    readonly reason: string;
    readonly notes?: string;
    readonly cancelledBy?: string;
    readonly cancellationReason?: string;
    readonly confirmedBy?: string;
    readonly completedBy?: string;
    readonly completedNotes?: string;
    readonly startedBy?: string;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    private constructor();
    static create(props: Omit<AppointmentProps, 'id'>): Appointment;
    static validate(props: Partial<AppointmentProps>): void;
    confirm(confirmedBy: string): Appointment;
    cancel(cancelledBy: string, reason?: string): Appointment;
    complete(completedBy: string, notes?: string): Appointment;
    markAsNoShow(): Appointment;
    updateNotes(notes: string): Appointment;
    start(startedBy: string): Appointment;
    toProps(): AppointmentProps;
    isValid(): boolean;
    isUpcoming(): boolean;
    isPast(): boolean;
    canBeModified(): boolean;
}
//# sourceMappingURL=Appointment.d.ts.map