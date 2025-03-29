import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import packageJson from './package.json';

import { getDevInfo, getProxy, logDevInfo } from './supos.dev';

const devInfo = getDevInfo();
const proxy = getProxy(devInfo.API_PROXY_URL, devInfo.SINGLE_API_PROXY_LIST, devInfo.SINGLE_API_PROXY_URL);
logDevInfo(devInfo);

// 生成格式化的时间
const buildTime = new Date().toLocaleString('zh-CN', {
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
  hour12: false, // 24小时制
});

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  esbuild: {
    drop: ['debugger'],
    pure: ['console.log'],
  },
  plugins: [
    react(),
    createHtmlPlugin({
      inject: {
        data: {
          VITE_APP_TITLE: process.env.VITE_APP_TITLE || 'supOS',
        },
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules'],
        javascriptEnabled: true,
        quietDeps: true,
      },
    },
  },
  assetsInclude: ['**/*.woff2', '**/*.woff', '**/*.ttf'],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    //导入文件时省略的扩展名
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx', '.json'],
  },
  define: {
    'process.env': { ...devInfo },
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    'import.meta.env.VITE_APP_BUILD_TIMESTAMP': JSON.stringify(buildTime),
  },
  envPrefix: ['REACT_APP_', 'VITE_', 'OPENAI_'],
  server: {
    proxy: {
      ...proxy,
      // '/copilotkit': 'http://localhost:4000',
    },
  },
  build: {
    outDir: 'build', // 设置构建输出目录为 build
  },
});
