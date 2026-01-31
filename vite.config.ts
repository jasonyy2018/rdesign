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
      cssCodeSplit: true,
      reportCompressedSize: false,
      target: 'esnext',
      minify: isProduction ? 'terser' : 'esbuild',
      assetsInlineLimit: 4096,
      chunkSizeWarningLimit: 2000,
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
            utils: ['axios', 'qs', 'moment', 'file-saver'],
            vendor: ['dompurify', 'xlsx', 'image-conversion']
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
          const buildMode = process.env.VITE_BUILD_MODE;
          if (buildMode !== 'ssr') return;

          const app = express();
          const staticDir = path.resolve(__dirname, VITE_OUTPUT_DIR);
          app.use(express.static(staticDir));
          app.get(/^\/(?!api).*/, (req, res) => {
            res.sendFile(path.join(staticDir, 'index.html'));
          });

          const server = app.listen(5137, '0.0.0.0', () => {
            console.log('Prerender server running at http://localhost:5137');
          });

          console.log('Starting Puppeteer prerender...');
          let browser;
          let retryCount = 0;
          const maxRetries = 3;

          while (retryCount < maxRetries) {
            try {
              console.log(`Launching browser (attempt ${retryCount + 1}/${maxRetries})...`);
              browser = await chrome.launch({
                headless: true,
                args: [
                  '--no-sandbox',
                  '--disable-setuid-sandbox',
                  '--disable-dev-shm-usage',
                  '--disable-gpu',
                  '--disable-software-rasterizer',
                  '--no-zygote',
                  '--disable-blink-features=AutomationControlled',
                  '--disable-web-security',
                  '--disable-features=IsolateOrigins,site-per-process',
                  '--disable-ipc-flooding-protection'
                ],
                timeout: 300000,
                protocolTimeout: 300000
              });
              console.log('Browser launched successfully');
              break;
            } catch (err) {
              retryCount++;
              console.error(`Launch attempt ${retryCount} failed:`, err);
              if (retryCount >= maxRetries) throw err;
              await new Promise((r) => setTimeout(r, 10000));
            }
          }

          try {
            const outputPath = path.resolve(__dirname, VITE_OUTPUT_DIR);
            const templateDir = path.join(outputPath, 'template');
            if (!fs.existsSync(templateDir)) fs.mkdirSync(templateDir, { recursive: true });

            const prerenderDataPath = path.resolve(__dirname, '.temp/prerender-data.json');
            let footerHtml = '';
            if (fs.existsSync(prerenderDataPath)) {
              try {
                const data = JSON.parse(fs.readFileSync(prerenderDataPath, 'utf-8'));
                footerHtml = data.FOOTER_HTML || '';
              } catch (e) {}
            }

            const renderPage = async (url, savePath, customTitle = '') => {
              const page = await browser.newPage();
              await page.setDefaultNavigationTimeout(180000);
              await page.setDefaultTimeout(180000);
              await page.setRequestInterception(true);
              page.on('request', (req) => {
                const type = req.resourceType();
                if (
                  ['image', 'media', 'font'].includes(type) ||
                  req.url().includes('iconfont.js')
                ) {
                  req.abort();
                } else {
                  req.continue();
                }
              });
              await page.setViewport({ width: 1920, height: 1080 });

              try {
                await page.goto(url, { waitUntil: 'networkidle2', timeout: 180000 });
                let html = await page.evaluate(() => document.documentElement.outerHTML);
                if (footerHtml && url.endsWith(':5137/')) {
                  html = html.replace('<div id="footer"></div>', footerHtml);
                }
                const injectedScript = '<script src="/static/native-events.js"></script>';
                if (customTitle) {
                  html = html.replace(/<title>.*<\/title>/, `<title>${customTitle}</title>`);
                }
                html = html.replace('</body>', `${injectedScript}</body>`);
                fs.writeFileSync(savePath, html, 'utf-8');
                console.log(`✅ Rendered: ${url}`);
              } catch (e) {
                console.error(`❌ Failed: ${url}`, e.message);
              } finally {
                await page.close();
              }
            };

            // 1. Home
            await renderPage('http://localhost:5137/', path.join(outputPath, 'index.html'));
            // 2. Sitemap
            await renderPage(
              'http://localhost:5137/sitemap',
              path.join(outputPath, 'sitemap.html')
            );
            // 3. Templates (Parallel batches to save memory and speed up)
            const BATCH_SIZE = 5;
            for (let i = 0; i < templates.length; i += BATCH_SIZE) {
              const batch = templates.slice(i, i + BATCH_SIZE);
              console.log(
                `Rendering batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(
                  templates.length / BATCH_SIZE
                )}...`
              );
              await Promise.all(
                batch.map((item) =>
                  renderPage(
                    `http://localhost:5137/resumedetail/${item.id}`,
                    path.join(templateDir, item.page),
                    `AI职升姬 - ${item.title}`
                  )
                )
              );
            }
          } catch (err) {
            console.error('Prerender failed:', err);
          } finally {
            if (browser) await browser.close();
            server.close();
          }
        }
      }
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
          target: 'http://localhost:3000',
          changeOrigin: true
        },
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  };
});
