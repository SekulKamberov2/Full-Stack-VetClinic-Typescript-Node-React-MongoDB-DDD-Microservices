import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../../application/auth/AuthService';
import { AuthFacade } from '../../application/auth/AuthFacade';
import { IUser } from '../../domain/user/User';

export interface GatewayRequest extends Request {
  user?: IUser;
}

const authService = new AuthService(process.env.AUTH_SERVICE_URL || 'http://auth-service:3001');
const authFacade = new AuthFacade(authService);

export const authenticate = async (req: GatewayRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const token = authHeader.replace('Bearer ', '').trim();
    const user = await authFacade.authenticate(token);

    req.user = user;
    next();
  } catch (err: any) {
    res.status(401).json({ success: false, message: err.message || 'Unauthorized' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: GatewayRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });

    try {
      authFacade.authorize(req.user, roles);
      next();
    } catch (err: any) {
      res.status(403).json({ success: false, message: err.message });
    }
  };
};
