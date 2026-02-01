const express = require('express');
const path = require('path');
const compression = require('compression');
const serveStatic = require('serve-static');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();
const port = process.env.PORT || 8080;
const backendUrl = process.env.BACKEND_URL || 'http://119.91.202.144:3399';

// 启用 Gzip 压缩
app.use(compression());

// 设置静态文件目录
const distPath = path.join(__dirname, 'dist');

// 代理配置：将 /huajian 和 /api 请求代理到后端服务器
// 注意：后端期望保留 /huajian 前缀，所以不要重写路径
const proxyOptions = {
  target: backendUrl,
  changeOrigin: true,
  secure: false
  // 不需要 pathRewrite，后端期望完整的 /huajian/* 路径
};

app.use('/huajian', createProxyMiddleware(proxyOptions));
app.use('/api', createProxyMiddleware(proxyOptions));

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
