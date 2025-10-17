import { Request, Response, NextFunction } from 'express';
import { verifyToken, generateToken, generateRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { IUser } from '../domain/user/User';
import { UserRoles } from '../domain/user/UserRole'; 
import { v4 as uuidv4 } from 'uuid';

export interface GatewayRequest extends Request {
  user?: IUser;
  csrfToken?: string;
}

const csrfTokens = new Map<string, { userId: string, expires: number }>();

export const authenticate = async (req: GatewayRequest, res: Response, next: NextFunction) => {
  try {
    let token = req.cookies?.access_token;

    if (!token) {
      const authHeader = req.headers['authorization'];
      if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.replace('Bearer ', '').trim();
      }
    }

    if (!token) {
      return res.status(401).json({ success: false, message: 'No token provided' });
    }

    const decoded = verifyToken(token);

    if (!UserRoles.isValid(decoded.role)) {
      return res.status(401).json({
        success: false,
        message: `Invalid user role: ${decoded.role}`,
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

    (req as any).proxyHeaders = {
      'x-user-id': decoded.id,
      'x-user-email': decoded.email,
      'x-user-role': decoded.role,
      'x-user-name': `${decoded.firstName} ${decoded.lastName}`,
    };

    next();
  } catch (err: any) {
    res.clearCookie('access_token');
    res.status(401).json({ success: false, message: err.message || 'Unauthorized' });
  }
};


export const authorize = (...roles: string[]) => {
  return (req: GatewayRequest, res: Response, next: NextFunction) => {
    if (!req.user) return res.status(401).json({ success: false, message: 'Not authenticated' });
    console.log('=== AUTHORIZE MIDDLEWARE ===');
    console.log('User:', req.user);
    console.log('User role:', req.user?.role);
    console.log('Required roles:', roles);
    console.log('Has required role:', roles.includes(req.user?.role || ''));
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `Forbidden: required roles [${roles.join(', ')}], your role is ${req.user.role}` 
      });
    }

    next();
  };
};

export const csrfProtection = (req: GatewayRequest, res: Response, next: NextFunction) => {
  const clientToken = req.headers['x-csrf-token'] as string;
  
  if (!clientToken) {
    return res.status(403).json({ success: false, message: 'CSRF token required' });
  }

  const storedToken = csrfTokens.get(clientToken);
  
  if (!storedToken) {
    return res.status(403).json({ success: false, message: 'Invalid CSRF token' });
  }

  if (Date.now() > storedToken.expires) {
    csrfTokens.delete(clientToken);
    return res.status(403).json({ success: false, message: 'CSRF token expired' });
  }

  if (req.user && storedToken.userId !== req.user.id) {
    return res.status(403).json({ success: false, message: 'CSRF token mismatch' });
  }

  csrfTokens.delete(clientToken);

  next();
};

export const generateCsrfToken = (userId: string): string => {
  const csrfToken = uuidv4();
  csrfTokens.set(csrfToken, { 
    userId, 
    expires: Date.now() + 15 * 60 * 1000
  });
  return csrfToken;
};

export const verifyAndRefreshToken = async (refreshToken: string): Promise<{ 
  success: boolean; 
  accessToken?: string; 
  refreshToken?: string;
  message?: string;
}> => {
  try {
    const { userId } = verifyRefreshToken(refreshToken);
    
    const newAccessToken = generateToken({
      id: userId,
      email: 'user@example.com', 
      role: 'client', 
      firstName: 'User',
      lastName: 'Name'
    });

    const newRefreshToken = generateRefreshToken(userId);

    return { 
      success: true, 
      accessToken: newAccessToken, 
      refreshToken: newRefreshToken 
    };
  } catch (error) {
    return { success: false, message: 'Invalid refresh token' };
  }
};

setInterval(() => {
  const now = Date.now();
  for (const [token, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(token);
    }
  }
}, 60 * 60 * 1000);
