import { ConfigEnv, defineConfig, loadEnv } from 'vite';
import type { UserConfig } from 'vite';
import { createVitePlugins } from './build/vite/plugin';
import { wrapperEnv } from './build/utils';
import autoprefixer from 'autoprefixer';
import compression from 'vite-plugin-compression';
import { ViteImageOptimizer } from 'vite-plugin-image-optimizer';
import path from 'path';
import chrome from 'puppeteer';
import express from 'express';
// import serveStatic from 'serve-static';

import templates from './public/static/templates.json';

const fs = require('fs');

const isProduction = process.env.VITE_ENV === 'production';
const isDev = !isProduction;

export default defineConfig(async ({ command, mode }: ConfigEnv): Promise<UserConfig> => {
  const root = process.cwd();
  const isBuild = command === 'build';
  const env = loadEnv(mode, root);
  const viteEnv = wrapperEnv(env);
  const { VITE_OUTPUT_DIR } = viteEnv;

  console.log('Building in:', isBuild ? 'production' : 'development');
  console.log('Environment variables:', viteEnv);

  return {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src')
      }
    },
    build: {
      sourcemap: isDev,
      outDir: VITE_OUTPUT_DIR,
      cssCodeSplit: false,
      reportCompressedSize: false,
      target: 'esnext',
      minify: isProduction ? 'terser' : 'esbuild',
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 5000,
      assetsDir: 'static',
      rollupOptions: {
        output: {
          manualChunks: {
            vue: ['vue', 'vue-router', 'pinia'],
            elementPlus: ['element-plus'],
            echarts: ['echarts'],
            wangeditor: ['@wangeditor/editor', '@wangeditor/editor-for-vue'],
            codemirror: ['codemirror', '@codemirror/lang-javascript', '@codemirror/lang-json'],
            lodash: ['lodash'],
            vendor: ['axios']
          },
          chunkFileNames: 'static/js/[name]-[hash].js',
          entryFileNames: 'static/js/[name]-[hash].js',
          assetFileNames: (chunkInfo) => {
            const extType = chunkInfo.name?.match(/\.(png|jpe?g|gif|svg)$/i)
              ? 'images'
              : chunkInfo.name?.match(/\.(woff2?|eot|ttf|otf)$/i)
              ? 'fonts'
              : chunkInfo.name?.match(/\.(mp4|webm|ogg|mp3|wav|flac|aac)$/i)
              ? 'media'
              : 'static';
            return `static/${extType}/[name]-[hash][extname]`;
          }
        },
        treeshake: true
      },
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.*'],
          passes: 3,
          dead_code: true,
          unused: true
        },
        mangle: {
          toplevel: true
        }
      }
    },
    css: {
      preprocessorOptions: {
        scss: {
          additionalData: '@use "@/style/global.scss" as *;'
        }
      },
      postcss: {
        plugins: [
          autoprefixer({
            overrideBrowserslist: [
              'Android >= 4.4',
              'iOS >= 9',
              'Chrome >= 49',
              'Firefox >= 45',
              'Safari >= 9',
              'last 2 versions',
              'not dead'
            ],
            grid: true,
            flexbox: 'no-2009'
          })
        ]
      }
    },
    plugins: [
      ...(await createVitePlugins(viteEnv, isBuild)),
      ViteImageOptimizer({
        png: {
          quality: 65,
          compressionLevel: 9
        },
        jpeg: {
          quality: 65,
          progressive: true
        },
        webp: {
          quality: 65,
          lossless: false
        },
        avif: {
          quality: 65,
          lossless: false
        }
      }),
      compression(),
      {
        name: 'puppeteer-prerender',
        closeBundle: async () => {
          if (!isBuild) return;
          console.log('process.env.VITE_BUILD_MODE', process.env.VITE_BUILD_MODE);
          const buildMode = process.env.VITE_BUILD_MODE;
          if (buildMode !== 'ssr') return;

          const app = express();
          const staticDir = path.resolve(__dirname, VITE_OUTPUT_DIR);

          // 先设置静态文件服务
          app.use(express.static(staticDir));

          // 然后设置SPA回退路由（修正后的写法）
          app.get(/^\/(?!api).*/, (req, res) => {
            res.sendFile(path.join(staticDir, 'index.html'));
          });

          const server = app.listen(5137, '0.0.0.0', () => {
            console.log('Prerender server running at http://localhost:5137');
          });

          console.log('Starting Puppeteer prerender for templates...');
          const browser = await chrome.launch({
            headless: true,
            args: [
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--disable-dev-shm-usage',
              '--disable-gpu',
              '--disable-software-rasterizer',
              '--disable-extensions',
              '--disable-default-apps',
              '--disable-background-timer-throttling',
              '--disable-backgrounding-occluded-windows',
              '--disable-renderer-backgrounding',
              '--disable-breakpad',
              '--disable-component-update',
              '--no-zygote',
              '--single-process'
            ],
            dumpio: false,
            timeout: 180000,
            protocolTimeout: 180000
          });

          try {
            const outputPath = path.resolve(__dirname, VITE_OUTPUT_DIR);
            const templateDir = path.join(outputPath, 'template');

            if (!fs.existsSync(templateDir)) {
              fs.mkdirSync(templateDir, { recursive: true });
            }

            // 加载预渲染数据
            const prerenderDataPath = path.resolve(__dirname, '.temp/prerender-data.json');
            let footerHtml = '';
            if (fs.existsSync(prerenderDataPath)) {
              try {
                const prerenderData = JSON.parse(fs.readFileSync(prerenderDataPath, 'utf-8'));
                footerHtml = prerenderData.FOOTER_HTML || '';
              } catch (err) {
                console.warn('⚠️ 解析 prerender-data.json 失败:', err);
              }
            }

            // 预渲染首页（包含footer HTML注入）
            console.log('Prerendering home page with footer...');
            const homePage = await browser.newPage();
            await homePage.setRequestInterception(true);
            homePage.on('request', (request) => {
              if (request.url().includes('iconfont.js')) {
                request.abort();
              } else {
                request.continue();
              }
            });
            await homePage.setViewport({
              width: 1920,
              height: 1080,
              deviceScaleFactor: 1,
              isMobile: false,
              hasTouch: false,
              isLandscape: false
            });

            try {
              await homePage.goto('http://localhost:5137/', {
                waitUntil: 'networkidle0',
                timeout: 180000
              });

              let homeHtml = await homePage.evaluate(() => document.documentElement.outerHTML);

              if (footerHtml) {
                homeHtml = homeHtml.replace('<div id="footer"></div>', footerHtml);
              }

              const homeInjectedScriptTag = '<script src="/static/native-events.js"></script>';
              homeHtml = homeHtml.replace('</body>', `${homeInjectedScriptTag}</body>`);

              fs.writeFileSync(path.join(outputPath, 'index.html'), homeHtml, {
                encoding: 'utf-8'
              });
              console.log('✅ Home page prerendered successfully');
            } catch (err) {
              console.error('Error prerendering home page:', err);
            } finally {
              await homePage.close();
            }

            // ============= 新增的sitemap预渲染部分 =============
            console.log('Prerendering sitemap page...');
            const sitemapPage = await browser.newPage();

            await sitemapPage.setRequestInterception(true);
            sitemapPage.on('request', (request) => {
              if (request.url().includes('iconfont.js')) {
                request.abort();
              } else {
                request.continue();
              }
            });

            await sitemapPage.setViewport({
              width: 1920,
              height: 1080,
              deviceScaleFactor: 1,
              isMobile: false,
              hasTouch: false,
              isLandscape: false
            });

            try {
              await sitemapPage.goto('http://localhost:5137/sitemap', {
                waitUntil: 'networkidle0',
                timeout: 180000
              });

              let sitemapHtml = await sitemapPage.evaluate(
                () => document.documentElement.outerHTML
              );

              const sitemapInjectedScriptTag = '<script src="/static/native-events.js"></script>';
              sitemapHtml = sitemapHtml.replace('</body>', `${sitemapInjectedScriptTag}</body>`);

              fs.writeFileSync(path.join(outputPath, 'sitemap.html'), sitemapHtml, {
                encoding: 'utf-8'
              });
              console.log('✅ Sitemap prerendered successfully');
            } catch (err) {
              console.error('Error prerendering sitemap:', err);
            } finally {
              await sitemapPage.close();
            }
            // ============= 新增部分结束 =============

            // 在线制作模版预渲染
            const idList = templates;
            console.log('idList', idList);

            for (let i = 0; i < idList.length; i++) {
              const id = idList[i].id;
              const pageName = idList[i].page;

              const page = await browser.newPage();

              // 设置拦截规则
              await page.setRequestInterception(true);
              page.on('request', (request) => {
                if (request.url().includes('iconfont.js')) {
                  request.abort();
                } else {
                  request.continue();
                }
              });

              console.log(`Prerendering template for id: ${id}`);

              // 设置视口为常见的桌面端尺寸（推荐）
              await page.setViewport({
                width: 1920,
                height: 1080,
                deviceScaleFactor: 1,
                isMobile: false,
                hasTouch: false,
                isLandscape: false
              });

              try {
                // 方法1：直接访问动态路由
                await page.goto(`http://localhost:5137/resumedetail/${id}`, {
                  waitUntil: 'networkidle0',
                  timeout: 180000
                });

                // 获取处理后的HTML
                const html = await page.evaluate(() => document.documentElement.outerHTML);

                // 插入 native-events.js 脚本
                const injectedScriptTag = '<script src="/static/native-events.js"></script>';
                const title = `AI职升姬 - ${idList[i].title}`;
                const modifiedHtml = html
                  .replace(/<title>.*<\/title>/, `<title>${title}</title>`)
                  .replace('</body>', `${injectedScriptTag}</body>`);

                // 保存文件
                fs.writeFileSync(path.join(templateDir, pageName), modifiedHtml, {
                  encoding: 'utf-8'
                });

                console.log(`Template ${i + 1} prerendered successfully`);
              } catch (err) {
                console.error(`Error prerendering id ${id}:`, err);
              } finally {
                await page.close();
              }
            }
          } catch (err) {
            console.error('Prerender failed:', err);
          } finally {
            await browser.close();
            server.close(() => {
              console.log('Prerender server closed');
            });
          }
        }
      }
      // ✅ 禁用 vite-plugin-prerender，使用自定义的 puppeteer-prerender
      // prerender({
      //   renderer: new prerender.PuppeteerRenderer({
      //     args: [
      //       '--no-sandbox',
      //       '--disable-setuid-sandbox',
      //       '--disable-gpu',
      //       '--disable-software-rasterizer',
      //       '--no-first-run',
      //       '--disable-accelerated-2d-canvas',
      //       '--disable-gl-drawing-for-tests'
      //     ],
      //     dumpio: true,
      //     timeout: 120000,
      //     protocolTimeout: 120000,
      //     maxConcurrentRoutes: 1
      //   }),
      //   staticDir: path.resolve(__dirname, VITE_OUTPUT_DIR),
      //   routes: ['/'],
      //   postProcess: (context) => {
      //     const dataPath = path.resolve(__dirname, '.temp/prerender-data.json');
      //     if (!context || !context.html) {
      //       console.warn('⚠️ context.html 不存在，可能未正确渲染');
      //       return context;
      //     }
      //     if (context.route === '/') {
      //       if (fs.existsSync(dataPath)) {
      //         try {
      //           const data = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
      //           context.html = context.html.replace(
      //             '<div id="footer"></div>',
      //             `${data.FOOTER_HTML}`
      //           );
      //           return context;
      //         } catch (err) {
      //           console.error('❌ 解析 prerender-data.json 失败:', err);
      //           return context;
      //         }
      //       } else {
      //         console.warn('⚠️ prerender-data.json 不存在于 .temp/，请检查是否成功生成');
      //         return context;
      //       }
      //     }
      //     return context;
      //   }
      // })
    ],
    esbuild: {
      logOverride: { 'this-is-undefined-in-esm': 'silent' }
    },
    server: {
      port: 8888,
      host: '0.0.0.0',
      open: true,
      hmr: true,
      proxy: {
        '/huajian': {
          target: 'http://localhost:3000', // 开发环境代理至本地后台
          changeOrigin: true
        },
        '/api': {
          target: 'http://localhost:3000', // 开发环境代理至本地后台
          changeOrigin: true
        }
      }
    }
  };
});
