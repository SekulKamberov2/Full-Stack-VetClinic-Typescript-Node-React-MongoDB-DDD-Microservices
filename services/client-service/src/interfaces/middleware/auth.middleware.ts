import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    role: string;
    firstName: string;
    lastName: string;
  };
}

export const authenticateToken = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  try {
    let token = req.cookies?.access_token;

    if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '').trim();
      }
    }

    if (!token) {
      res.status(401).json({ 
        success: false, 
        message: 'Access token required' 
      });
      return;
    }

    const secret = 'your-super-secret-jwt-key-change-in-production-12345';
    const decoded = jwt.verify(token, secret) as any;
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: decoded.role,
      firstName: decoded.firstName,
      lastName: decoded.lastName
    };

    console.log('Client-Service: Authenticated user:', req.user);
    next();
  } catch (error) {
    console.error('Client-Service: Token verification failed:', error);
    res.status(403).json({ 
      success: false, 
      message: 'Invalid or expired token' 
    });
    return;
  }
};

export const requireClient = (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({ 
      success: false, 
      message: 'Authentication required' 
    });
    return;
  }

  const allowedRoles = ['client', 'vet', 'staff', 'admin'];
  if (!allowedRoles.includes(req.user.role)) {
    res.status(403).json({ 
      success: false, 
      message: `Access denied. Allowed roles: ${allowedRoles.join(', ')}` 
    });
    return;
  }

  next();
};
