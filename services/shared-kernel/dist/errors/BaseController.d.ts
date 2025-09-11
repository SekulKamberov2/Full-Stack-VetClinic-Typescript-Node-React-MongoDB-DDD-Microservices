export interface AppResponse {
    status(code: number): AppResponse;
    json(data: any): AppResponse;
    send(data: any): AppResponse;
}
export interface AppRequest {
    params: Record<string, string>;
    body: Record<string, any>;
    query: Record<string, string>;
    headers: Record<string, string>;
}
export declare abstract class BaseController {
    protected handleSuccess(res: AppResponse, data: any, statusCode?: number): void;
    protected handleError(res: AppResponse, error: unknown): void;
    protected validateRequiredParam(param: any, paramName: string, context?: string): void;
    protected validateObjectId(id: string, paramName: string, context?: string): void;
    private getStatusCode;
}
