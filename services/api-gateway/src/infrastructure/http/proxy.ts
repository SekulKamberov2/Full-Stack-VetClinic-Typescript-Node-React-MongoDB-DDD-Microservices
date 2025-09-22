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
      if (req.body && Object.keys(req.body).length > 0) {
        const bodyData = JSON.stringify(req.body);

        proxyReq.setHeader('Content-Type', 'application/json');
        proxyReq.setHeader('Content-Length', Buffer.byteLength(bodyData));

        proxyReq.write(bodyData);
        proxyReq.end();
      }
    }
  });
}
