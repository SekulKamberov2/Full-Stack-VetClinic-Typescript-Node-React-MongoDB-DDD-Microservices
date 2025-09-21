import { Request } from 'express';
import { createProxyMiddleware, Options as ProxyOptions } from 'http-proxy-middleware';
 
export const createServiceProxy = (
  targetUrl: string,
  pathRewrite: Record<string, string> = {},
  authRequired = true
) => {
  const options: ProxyOptions = {
    target: targetUrl,
    changeOrigin: true,
    pathRewrite,
    onProxyReq: (proxyReq: any, req: Request) => {
      console.log(`Proxying: ${req.method} ${req.url} -> ${targetUrl}`);
      
      if (req.body) {
        const bodyData = JSON.stringify(req.body);
        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));
        proxyReq.write(bodyData);
      }
      
      if (authRequired && req.headers['authorization']) {
        proxyReq.setHeader('Authorization', req.headers['authorization']);
      }
    },
    onError: (err: Error, _req: Request, res: any) => {
      console.error(`Proxy error for ${targetUrl}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({ success: false, message: 'Bad Gateway' });
      }
    },
  };

  return createProxyMiddleware(options);
};