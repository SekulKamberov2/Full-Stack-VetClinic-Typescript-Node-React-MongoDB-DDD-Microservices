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

export const generateToken = (payload: Omit<JwtPayload, 'iat' | 'exp'>): string => {
  //const secret = process.env.JWT_SECRET;' 
   const secret = 'your-super-secret-jwt-key-change-in-production-12345'; 
   console.log('API GATEWAY secret', secret)
  if (!secret) {
    throw new AppError(
      'JWT_SECRET is not defined in environment variables',
      'MISSING_JWT_SECRET',
      undefined,
      'generateToken'
    );
  }

  return jwt.sign(payload, secret, { expiresIn: '15m' });
};

export const generateRefreshToken = (userId: string): string => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-jwt-key-change-in-production-12345' + '-refresh';
  
  if (!secret) {
    throw new AppError(
      'JWT_SECRET is not defined',
      'MISSING_JWT_SECRET',
      undefined,
      'generateRefreshToken'
    );
  }

  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = 'your-super-secret-jwt-key-change-in-production-12345'; //process.env.JWT_SECRET;
  
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

export const verifyRefreshToken = (token: string): { userId: string } => {
  const secret = process.env.JWT_REFRESH_SECRET || 'your-super-secret-jwt-key-change-in-production-12345' + '-refresh';
  
  if (!secret) {
    throw new AppError(
      'JWT_SECRET is not defined',
      'MISSING_JWT_SECRET',
      undefined,
      'verifyRefreshToken'
    );
  }

  try {
    const decoded = jwt.verify(token, secret) as { userId: string };
    return decoded;
  } catch (error) {
    throw new AuthorizationError('Invalid refresh token');
  }
};
