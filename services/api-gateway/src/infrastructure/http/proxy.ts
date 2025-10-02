import { createProxyMiddleware } from 'http-proxy-middleware';

export function createServiceProxy(
  target: string,
  pathRewrite: Record<string, string>,
  changeOrigin = true
) {
  return createProxyMiddleware({
    target,
    changeOrigin,
    pathRewrite,
    onProxyReq: (proxyReq, req: any) => {
      if (req.cookies && Object.keys(req.cookies).length > 0) {
        const cookieString = Object.keys(req.cookies)
          .map(key => `${key}=${req.cookies[key]}`)
          .join('; ');
        proxyReq.setHeader('Cookie', cookieString);
      }

      const token = req.cookies?.access_token;
      if (token && !req.headers.authorization) {
        proxyReq.setHeader('Authorization', `Bearer ${token}`);
      } else if (req.headers.authorization) {
        console.log('Using existing Authorization header');
      } else {
        console.log('No Authorization token found');
      }

      if (req.user) {
        proxyReq.setHeader('x-user-id', req.user.id);
        proxyReq.setHeader('x-user-email', req.user.email);
        proxyReq.setHeader('x-user-role', req.user.role); 
      }

      if (req.body && Object.keys(req.body).length > 0) { 
        proxyReq.removeHeader('Content-Length');
        
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        
        proxyReq.write(bodyData); 
      } 
    },
    onProxyRes: (proxyRes, _req: any, _res: any) => {
      console.log('Service response status:', proxyRes.statusCode);
      console.log('Service response headers:', proxyRes.headers);
    },
    onError: (err, _req, res: any) => {
      console.error('Proxy error:', err);
      res.status(502).json({ 
        success: false, 
        message: 'Service unavailable: ' + err.message 
      });
    },
    timeout: 10000 
  });
}
