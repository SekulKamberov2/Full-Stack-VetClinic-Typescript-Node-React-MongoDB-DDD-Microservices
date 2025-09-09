import { AppRequest } from "./AppRequest";
import { ValidationError } from "./ValidationError"; 

export class RequestValidator {
  static validateRequiredParams(req: AppRequest, paramNames: string[], context: string = 'RequestValidator'): void {
    for (const paramName of paramNames) {
      const param = req.params[paramName] || req.body[paramName] || req.query[paramName];
      if (!param || (typeof param === 'string' && param.trim() === '')) {
        throw new ValidationError(
          `${paramName} is required`, 
          undefined, 
          context
        );
      }
    }
  }

  static validateObjectIds(req: AppRequest, paramNames: string[], context: string = 'RequestValidator'): void {
    for (const paramName of paramNames) {
      const param = req.params[paramName] || req.body[paramName] || req.query[paramName];
      this.validateObjectId(param, paramName, context);
    }
  }

  static validateObjectId(id: string, paramName: string, context: string = 'RequestValidator'): void {
    this.validateRequiredParam(id, paramName, context);
    
    if (!/^[0-9a-fA-F]{24}$/.test(id)) {
      throw new ValidationError(
        `Invalid ${paramName} format`, 
        undefined, 
        context
      );
    }
  }

  static validateRequiredParam(param: any, paramName: string, context: string = 'RequestValidator'): void {
    if (!param || (typeof param === 'string' && param.trim() === '')) {
      throw new ValidationError(
        `${paramName} is required`, 
        undefined, 
        context
      );
    }
  }
}
