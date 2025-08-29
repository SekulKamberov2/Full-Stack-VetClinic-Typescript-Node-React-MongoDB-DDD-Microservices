import jwt, { SignOptions } from 'jsonwebtoken';
import { IUser } from '../models/User';

export interface JwtPayload {
  id: string;
  email: string;
  role: string;
  firstName: string;
  lastName: string;
  iat?: number;
  exp?: number;
}

export class JWTError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'JWTError';
  }
}

export const generateToken = (user: IUser): string => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new JWTError('JWT_SECRET is not defined in environment variables');
  }

  const payload: JwtPayload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    firstName: user.firstName,
    lastName: user.lastName,
  };
 
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  const signOptions: SignOptions = {};
 
  if (expiresIn) {
    // numeric string, convert to number
    if (/^\d+$/.test(expiresIn)) {
      signOptions.expiresIn = parseInt(expiresIn, 10);
    } else { 
      // jwt.sign accepts string formats like "1d", "2h", "3m", "4s"
      const validFormats = ['d', 'h', 'm', 's', 'ms'];
      const format = expiresIn.slice(-1);
      
      if (validFormats.includes(format)) {
        signOptions.expiresIn = expiresIn as jwt.SignOptions['expiresIn'];
      } else {
        // Default to 7 days if format is invalid
        signOptions.expiresIn = '7d';
      }
    }
  }

  try {
    return jwt.sign(payload, secret, signOptions);
  } catch (error) {
    throw new JWTError(`Failed to generate token: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const verifyToken = (token: string): JwtPayload => {
  const secret = process.env.JWT_SECRET;
  
  if (!secret) {
    throw new JWTError('JWT_SECRET is not defined in environment variables');
  }

  try {
    const decoded = jwt.verify(token, secret);
    
    if (typeof decoded === 'string') {
      throw new JWTError('Invalid token format');
    }

    return decoded as JwtPayload;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new JWTError('Invalid token');
    } else if (error instanceof jwt.TokenExpiredError) {
      throw new JWTError('Token expired');
    } else if (error instanceof jwt.NotBeforeError) {
      throw new JWTError('Token not yet valid');
    }
    throw new JWTError('Failed to verify token');
  }
};
 
export const isTokenExpiringSoon = (token: string, thresholdSeconds: number = 3600): boolean => {
  try {
    const payload = verifyToken(token);
    if (!payload.exp) return false;
    
    const now = Math.floor(Date.now() / 1000);
    return (payload.exp - now) <= thresholdSeconds;
  } catch {
    return true; // If can't verify, assume it's expiring
  }
};