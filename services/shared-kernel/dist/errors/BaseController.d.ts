import { Response } from "express";
export declare abstract class BaseController {
    protected handleSuccess(res: Response, data: any, statusCode?: number): void;
    protected handleError(res: Response, error: unknown): void;
    protected validateRequiredParam(param: any, paramName: string, context?: string): void;
    protected validateObjectId(id: string, paramName: string, context?: string): void;
    private getStatusCode;
}
