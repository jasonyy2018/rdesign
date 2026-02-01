const express = require('express');
const path = require('path');
const compression = require('compression');
const serveStatic = require('serve-static');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 8080;
const backendUrl = process.env.BACKEND_URL || 'http://119.91.202.144:3399';
const articlesUrl = process.env.ARTICLES_URL || 'http://119.91.202.144:3210';

// 启用 Gzip 压缩
app.use(compression());

// 1. 爬虫检测中间件（预渲染逻辑）
const botRegex =
  /googlebot|bingbot|yandex|baiduspider|sogouspider|haosouspider|360spider|shenmaspider|sm|yahoo|msnbot|duckduckbot|exabot|facebot|ia_archiver|applebot|slurp|gigabot|teoma|twiceler|rogerbot|voilabot|findlinks|naverbot|mj12bot|ahrefsbot|semrushbot|zoombot|mail\.ru|seznambot|dotbot|liebaospider|curl|wget|python|java|httpclient|go-http|okhttp/i;

app.use((req, res, next) => {
  const ua = req.headers['user-agent'] || '';
  if (botRegex.test(ua)) {
    // 排除静态资源请求
    const isStaticAsset =
      /\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ico|webp|mp4|webm|mp3|ttf|eot)$/i.test(req.path);
    if (!isStaticAsset && !req.path.startsWith('/huajian') && !req.path.startsWith('/api')) {
      console.log(`[Bot Detected] Proxying to prerender: ${req.path}`);
      return createProxyMiddleware({
        target: backendUrl,
        changeOrigin: true,
        pathRewrite: (path) => `/huajian/render${path}`
      })(req, res, next);
    }
  }
  next();
});

// 2. 代理配置：将 /huajian 和 /api 请求代理到后端服务器
// 注意：后端期望保留 /huajian 前缀，所以不要重写路径
const proxyOptions = {
  target: backendUrl,
  changeOrigin: true,
  secure: false,
  logLevel: 'debug',
  onProxyReq: (proxyReq, req) => {
    // 确保 Host 头部正确
    proxyReq.setHeader('Host', new URL(backendUrl).host);
    console.log(`[Proxy] ${req.method} ${req.path} -> ${backendUrl}${req.path}`);
  },
  onProxyRes: (proxyRes, req) => {
    console.log(`[Proxy Response] ${req.method} ${req.path} -> ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`[Proxy Error] ${req.method} ${req.path}:`, err.message);
    res.status(502).json({ error: 'Proxy error', message: err.message });
  }
};

app.use('/huajian', createProxyMiddleware(proxyOptions));
app.use('/api', createProxyMiddleware(proxyOptions));

// 3. 职场攻略 (WordPress) 代理
app.use(
  '/articles',
  createProxyMiddleware({
    target: articlesUrl,
    changeOrigin: true,
    pathRewrite: {
      '^/articles': '/' // Nginx 中的 rewrite ^/articles(/.*)$ $1 break;
    }
  })
);

// 设置静态文件目录
const distPath = path.join(__dirname, 'dist');

// 缓存控制：为哈希资源设置强缓存，为 HTML 设置协商缓存
const staticOptions = {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    // 如果是 HTML 文件，禁用强缓存，改用协商缓存
    if (path.extname(filePath) === '.html') {
      res.setHeader('Cache-Control', 'public, max-age=0, must-revalidate');
    } else if (filePath.includes('static/')) {
      // 所有的静态资源（js/css/images/fonts）都在 static 目录下，且带有 hash
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    }
  }
};

// 静态服务
app.use(serveStatic(distPath, staticOptions));

// SPA 路由回退：所有不匹配的路由都返回 index.html
// 在 Express 5 中，通配符语法已更改，必须使用命名参数，例如 *any
app.get('*any', (req, res) => {
  // 排除 API 和 代理路径
  if (req.path.startsWith('/api') || req.path.startsWith('/huajian')) return;
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Production server is running at http://0.0.0.0:${port}`);
  console.log(`Proxying /huajian and /api to: ${backendUrl}`);
  console.log(`Serving static files from: ${distPath}`);
});
