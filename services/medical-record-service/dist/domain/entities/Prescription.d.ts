export type PrescriptionStatus = 'pending' | 'filled' | 'cancelled' | 'completed';
export interface PrescriptionProps {
    id?: string | undefined;
    recordId?: string | undefined;
    medicationName: string;
    dosage: string;
    instructions: string;
    datePrescribed?: Date | undefined;
    refills: number;
    filledDate?: Date | undefined;
    filledBy?: string | undefined;
    status?: PrescriptionStatus | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}
export declare class Prescription {
    readonly id: string;
    readonly recordId: string;
    readonly medicationName: string;
    readonly dosage: string;
    readonly instructions: string;
    readonly datePrescribed: Date;
    readonly refills: number;
    readonly filledDate?: Date | undefined;
    readonly filledBy?: string | undefined;
    readonly status: PrescriptionStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    private constructor();
    static create(props: PrescriptionProps): Prescription;
    update(updateData: Partial<Omit<PrescriptionProps, 'id' | 'recordId'>>): Prescription;
    setRecordId(recordId: string): Prescription;
    setId(id: string): Prescription;
    toProps(): PrescriptionProps;
    isNew(): boolean;
    markAsFilled(filledBy: string, filledDate?: Date): Prescription;
    markAsPending(): Prescription;
    cancel(): Prescription;
    complete(): Prescription;
    hasRefillsAvailable(): boolean;
    isFilled(): boolean;
    isPending(): boolean;
    isExpired(): boolean;
    isValid(): boolean;
    getSummary(): string;
    canBeFilled(): boolean;
    requiresRefill(): boolean;
}
//# sourceMappingURL=Prescription.d.ts.map