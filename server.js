const express = require('express');
const path = require('path');
const compression = require('compression');
const serveStatic = require('serve-static');

const app = express();
const port = process.env.PORT || 8080;

// 启用 Gzip 压缩
app.use(compression());

// 设置静态文件目录
const distPath = path.join(__dirname, 'dist');

// 缓存控制：为哈希资源设置强缓存，为 HTML 设置协商缓存
const staticOptions = {
  maxAge: '1y',
  setHeaders: (res, filePath) => {
    // 如果是 HTML 文件，禁用强缓存，改用协商缓存
    if (serveStatic.mime.lookup(filePath) === 'text/html') {
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
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(port, '0.0.0.0', () => {
  console.log(`Production server is running at http://0.0.0.0:${port}`);
  console.log(`Serving static files from: ${distPath}`);
});
