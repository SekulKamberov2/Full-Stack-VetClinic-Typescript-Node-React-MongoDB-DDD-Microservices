import { Diagnosis } from "../../domain/entities/Diagnosis";
import { DiagnosisRepository } from "../../domain/repositories/DiagnosisRepository";
export declare class GetDiagnosisByIdUseCase {
    private diagnosisRepository;
    constructor(diagnosisRepository: DiagnosisRepository);
    execute(diagnosisId: string): Promise<Diagnosis>;
}
//# sourceMappingURL=GetDiagnosisByIdUseCase.d.ts.map