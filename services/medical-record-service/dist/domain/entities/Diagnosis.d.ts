export interface DiagnosisProps {
    id?: string | undefined;
    recordId?: string | undefined;
    description: string;
    date?: Date | undefined;
    notes?: string | undefined;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}
export declare class Diagnosis {
    readonly id: string;
    readonly recordId: string;
    readonly description: string;
    readonly date: Date;
    readonly notes?: string | undefined;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    private constructor();
    static create(props: DiagnosisProps): Diagnosis;
    updateDetails(updateData: Partial<Omit<DiagnosisProps, 'id' | 'recordId'>>): Diagnosis;
    setRecordId(recordId: string): Diagnosis;
    setId(id: string): Diagnosis;
    toProps(): DiagnosisProps;
    isValid(): boolean;
    getSummary(): string;
    hasNotes(): boolean;
    isRecent(maxDays?: number): boolean;
}
//# sourceMappingURL=Diagnosis.d.ts.map