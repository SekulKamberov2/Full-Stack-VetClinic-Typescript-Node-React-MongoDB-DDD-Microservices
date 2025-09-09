export interface TreatmentProps {
    id?: string | undefined;
    recordId?: string | undefined;
    name: string;
    description: string;
    date?: Date | undefined;
    cost: number;
    createdAt?: Date | undefined;
    updatedAt?: Date | undefined;
}
export declare class Treatment {
    readonly id: string;
    readonly recordId: string;
    readonly name: string;
    readonly description: string;
    readonly date: Date;
    readonly cost: number;
    readonly createdAt: Date;
    readonly updatedAt: Date;
    private constructor();
    static create(props: TreatmentProps): Treatment;
    update(updateData: Partial<Omit<TreatmentProps, 'id' | 'recordId'>>): Treatment;
    setRecordId(recordId: string): Treatment;
    setId(id: string): Treatment;
    toProps(): TreatmentProps;
    isNew(): boolean;
    getFormattedCost(): string;
    isRecent(): boolean;
    isValid(): boolean;
    getSummary(): string;
    isExpensive(): boolean;
    isStandardCost(): boolean;
    isLowCost(): boolean;
    updateCost(newCost: number): Treatment;
    updateDescription(newDescription: string): Treatment;
    updateName(newName: string): Treatment;
    isFutureDated(): boolean;
    isPastDated(): boolean;
    isToday(): boolean;
}
//# sourceMappingURL=Treatment.d.ts.map