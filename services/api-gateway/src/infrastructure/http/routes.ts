import { Router } from 'express';
import { createServiceProxy } from './proxy';
import { authenticate, authorize,
  generateCsrfToken, verifyAndRefreshToken } from '../../middleware/auth';
import cookieParser from 'cookie-parser';

const router = Router();

router.use(cookieParser()); 

router.use((req, _res, next) => {
  console.log('=== API GATEWAY REQUEST ===');
  console.log('Path:', req.path);
  console.log('Method:', req.method);
  console.log('Cookies:', req.cookies);
  console.log('Headers:', req.headers);
  next();
});
 
router.use((req: any, _res, next) => {
  if (req.user) {
    console.log('Authenticated User:', req.user);
    console.log('Proxy Headers:', req.proxyHeaders);
  }
  next();
});
router.get('/health', (_req, res) => res.json({ success: true, message: 'API Gateway healthy' }));

router.get('/auth/csrf-token', authenticate, (req: any, res) => {
  const csrfToken = generateCsrfToken(req.user!.id);
  res.json({ 
    success: true, 
    csrfToken 
  });
});

router.post('/auth/refresh', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refresh_token;
    
    if (!refreshToken) {
      return res.status(401).json({ success: false, message: 'No refresh token' });
    }

    const result = await verifyAndRefreshToken(refreshToken);
    
    if (!result.success) {
      res.clearCookie('access_token');
      res.clearCookie('refresh_token');
      return res.status(401).json({ success: false, message: result.message });
    }

    res.cookie('access_token', result.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 15 * 60 * 1000,
      path: '/'
    });

    res.cookie('refresh_token', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/auth/refresh'
    });

    res.json({ 
      success: true, 
      message: 'Token refreshed successfully',
      accessToken: result.accessToken
    });

  } catch (error) {
    console.error('Token refresh error:', error);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token');
    res.status(401).json({ success: false, message: 'Token refresh failed' });
  }
});

router.post('/auth/logout', (_req, res) => {
  res.clearCookie('access_token');
  res.clearCookie('refresh_token');
  res.clearCookie('csrf_token');
  
  res.json({ 
    success: true, 
    message: 'Logged out successfully' 
  });
});

router.get('/auth/verify', authenticate, (req: any, res) => {
  res.json({ 
    success: true, 
    user: req.user 
  });
});

router.post('/auth/login', async (req, res, _next) => {
  try { 
    console.log('=== API GATEWAY LOGIN START ===');
    
    const response = await fetch(`${process.env.AUTH_SERVICE_URL || 'http://auth-service:3001'}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    console.log('Auth-service response status:', response.status);
    console.log('Auth-service response data:', data);

    res.status(response.status);

    const cookies = response.headers.get('set-cookie');
    if (cookies) {
      console.log('Forwarding auth-service cookies to client:', cookies);
      res.setHeader('set-cookie', cookies);
    } else {
      console.log('No cookies from auth-service!');
    }

    console.log('=== API GATEWAY LOGIN END ===');
    res.json(data);

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login service unavailable' });
  }
});
 
router.post('/auth/register', async (req, res) => {
  try {
    const response = await fetch(`${process.env.AUTH_SERVICE_URL || 'http://auth-service:3001'}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json() as {
      success: boolean;
      data?: {
        user: any;
        token: string;
        accessToken?: string;
        refreshToken?: string;
      };
      message?: string;
    };

    if (response.ok && data.success && data.data?.token) { 
      res.cookie('access_token', data.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 15 * 60 * 1000,
        path: '/'
      });

      res.cookie('refresh_token', data.data.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
        path: '/auth/refresh'
      });
  
      const { token, ...responseWithoutToken } = data.data;
      res.json({
        ...data,
        data: responseWithoutToken
      });
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration service unavailable' });
  }
});

router.use((req, _res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Cookies:', req.cookies);
  console.log('CSRF Token Header:', req.headers['x-csrf-token']);
  next();
}); 

router.use(
  '/patients',
  authenticate,
  authorize('vet', 'admin', 'client'),
  createServiceProxy('http://patient-service:3003', {   
    '^/patients': '/api/patients' 
  }, true)
);

router.use(
  '/clients',
  authenticate,
  authorize('vet', 'admin', 'client'),
  createServiceProxy('http://client-service:3002', {   
    '^/clients': '/api/clients' 
  }, true)
);

router.all(
  '/profile',
  authenticate,
  authorize('client', 'vet', 'staff', 'admin'),
  createServiceProxy('http://client-service:3002', {   
    '^/profile': '/api/profile' 
  }, true)
);

router.all(
  '/edit',
  authenticate,
  authorize('client', 'vet'),
  createServiceProxy('http://client-service:3002', {   
    '^/edit': '/api/profile/edit'
  }, true)
);
 
router.use(
  '/client-pets',
  authenticate,
  authorize('vet', 'admin', 'client'),
  createServiceProxy('http://client-service:3002', {   
    '^/client-pets': '/api/client-pets' 
  }, true)
);

router.use(
  '/pets-awards',
  authenticate,
  authorize('vet', 'admin', 'client'),
  createServiceProxy('http://client-service:3002', {   
    '^/pets-awards': '/api/client-pets-awards' 
  }, true)
);

router.use('/appointments', authenticate, createServiceProxy(
  'http://appointment-service:3004', 
  { '^/appointments': '/' }
));

router.use('/billing', authenticate, authorize('admin'), createServiceProxy(
  'http://billing-service:3005', 
  { '^/billing': '/' }
));

router.use('/medical-records', authenticate, authorize('vet', 'admin'), createServiceProxy(
  'http://medical-record-service:3006', 
  { '^/medical-records': '/' }
));

export default router;
