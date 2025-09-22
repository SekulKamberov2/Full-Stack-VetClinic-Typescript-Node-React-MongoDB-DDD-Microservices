import { AppRequest } from "./AppRequest";
export declare class RequestValidator {
    static validateRequiredParams(req: AppRequest, paramNames: string[], context?: string): void;
    static validateObjectIds(req: AppRequest, paramNames: string[], context?: string): void;
    static validateObjectId(id: string, paramName: string, context?: string): void;
    static validateRequiredParam(param: any, paramName: string, context?: string): void;
    static isValidEmail(email: string): boolean;
}
//# sourceMappingURL=RequestValidator.d.ts.map