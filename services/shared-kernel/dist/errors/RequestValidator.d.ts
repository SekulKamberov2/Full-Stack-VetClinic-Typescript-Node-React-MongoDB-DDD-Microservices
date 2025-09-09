import { Request } from "express";
export declare class RequestValidator {
    static validateRequiredParams(req: Request, paramNames: string[], context?: string): void;
    static validateObjectIds(req: Request, paramNames: string[], context?: string): void;
    static validateObjectId(id: string, paramName: string, context?: string): void;
    static validateRequiredParam(param: any, paramName: string, context?: string): void;
}
