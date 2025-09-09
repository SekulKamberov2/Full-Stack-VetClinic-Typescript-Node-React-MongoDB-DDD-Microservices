import { AppError } from "./AppError";
import { ValidationError } from "./ValidationError";
import { NotFoundError } from "./NotFoundError";
import { AuthorizationError } from "./AuthorizationError";
import { ErrorHandler } from "./ErrorHandler";

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

export abstract class BaseController {
  protected handleSuccess(res: AppResponse, data: any, statusCode: number = 200): void {
    res.status(statusCode).json({
      success: true,
      data
    });
  }

  protected handleError(res: AppResponse, error: unknown): void {
    console.error(`${this.constructor.name} error:`, error);
    
    if (AppError.isAppError(error)) {
      const statusCode = this.getStatusCode(error);
      res.status(statusCode).json({
        success: false,
        error: {
          message: error.message,
          code: error.code,
          context: error.context,
          timestamp: error.timestamp.toISOString()
        }
      });
      return;
    }

    const unknownError = ErrorHandler.handleAppError(error, this.constructor.name);
    res.status(500).json({
      success: false,
      error: {
        message: "Internal server error",
        code: "INTERNAL_ERROR",
        timestamp: new Date().toISOString()
      }
    });
  }

  protected validateRequiredParam(param: any, paramName: string, context: string = 'Controller'): void {
    if (!param || (typeof param === 'string' && param.trim() === '')) {
      throw new ValidationError(
        `${paramName} is required`, 
        undefined, 
        context
      );
    }
  }

  protected validateObjectId(id: string, paramName: string, context: string = 'Controller'): void {
    this.validateRequiredParam(id, paramName, context);
    
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new ValidationError(
        `Invalid ${paramName} format`, 
        undefined, 
        context
      );
    }
  }

    private getStatusCode(error: AppError): number {
        if (error instanceof ValidationError) {
          return 400;
        }  else if (error instanceof NotFoundError) {
          return 404;
        } else if (error instanceof AuthorizationError) {
          return 403;
        } else if (error.code === 'UNAUTHORIZED') {
          return 401;
        }  else {
          return 500;
        }
    }
}
