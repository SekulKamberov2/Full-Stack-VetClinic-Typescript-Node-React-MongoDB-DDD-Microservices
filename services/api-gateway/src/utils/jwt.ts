import jwt from 'jsonwebtoken';
import { AppError, ValidationError, AuthorizationError } from '@vetclinic/shared-kernel';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

export const verifyToken = (token: string): JwtPayload => {
  const secret = 'your-super-secret-jwt-key-change-in-production-12345' //process.env.JWT_SECRET;
  
  if (!secret) {
    throw new AppError(
      'JWT_SECRET is not defined in environment variables',
      'MISSING_JWT_SECRET',
      undefined,
      'verifyToken'
    );
  }

  if (!token || token.trim() === '') {
    throw new ValidationError(
      'Token is required',
      undefined,
      'verifyToken'
    );
  }

  try {
    const decoded = jwt.verify(token, secret);
    
    if (typeof decoded === 'string') {
      throw new ValidationError(
        'Invalid token format',
        undefined,
        'verifyToken'
      );
    }

    return decoded as JwtPayload;
  } catch (error) {
    const context = 'verifyToken';
    
    if (AppError.isAppError(error)) {
      throw error;
    }
    
    if (error instanceof jwt.JsonWebTokenError) {
      throw new AuthorizationError(
        'Invalid token',
        error,
        context
      );
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new AuthorizationError(
        'Token expired',
        error,
        context
      );
    } else if (error instanceof jwt.NotBeforeError) {
      throw new AuthorizationError(
        'Token not yet valid',
        error,
        context
      );
    }
    
    throw AppError.fromUnknown(error, context);
  }
};