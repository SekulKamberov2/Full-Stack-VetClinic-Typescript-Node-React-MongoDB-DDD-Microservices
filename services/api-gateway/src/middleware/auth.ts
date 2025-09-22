import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { IUser } from '../domain/user/User';
import { UserRoles } from '../domain/user/UserRole'; 

export interface GatewayRequest extends Request {
  user?: IUser;
}

export const authenticate = async (req: GatewayRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
     
    const decoded = verifyToken(token);
    
    if (!UserRoles.isValid(decoded.role)) {
      return res.status(401).json({ 
        success: false, 
        message: `Invalid user role: ${decoded.role}` 
      });
    }

    const userRole = decoded.role as 'admin' | 'vet' | 'staff' | 'client';
    
    req.user = {
      id: decoded.id,
      email: decoded.email,
      role: userRole,
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };
    
    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message || 'Unauthorized' });
  }
};
 
export const authorize = (...roles: string[]) => {
  return (req: GatewayRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: required roles [${roles.join(', ')}], your role is ${req.user.role}` 
      });
    }

    next();
  };
};