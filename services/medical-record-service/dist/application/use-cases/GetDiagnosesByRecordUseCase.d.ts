import { Diagnosis } from "../../domain/entities/Diagnosis";
import { DiagnosisRepository } from "../../domain/repositories/DiagnosisRepository";
export declare class GetDiagnosesByRecordUseCase {
    private diagnosisRepository;
    constructor(diagnosisRepository: DiagnosisRepository);
    execute(recordId: string): Promise<Diagnosis[]>;
}
//# sourceMappingURL=GetDiagnosesByRecordUseCase.d.ts.map