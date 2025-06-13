import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';
import packageJson from './package.json';
import legacy from '@vitejs/plugin-legacy';
import { federation } from '@module-federation/vite';

import { getDevInfo, getProxy, logDevInfo } from './supos.dev';
// import { AuthButton } from './src/components';

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
  base: devInfo.VITE_ASSET_PREFIX || '/',
  esbuild: {
    drop: ['debugger'],
    pure: ['console.log'],
    supported: {
      'top-level-await': true,
    },
  },
  plugins: [
    react(),
    legacy({
      targets: ['chrome>=89', 'safari>=15', 'firefox>=89', 'edge>=89'],
      modernPolyfills: true,
    }),
    createHtmlPlugin({
      inject: {
        data: {
          VITE_APP_TITLE: process.env.VITE_APP_TITLE || 'supOS',
        },
      },
    }),
    federation({
      name: 'supos-ce/host',
      manifest: true,
      // remotes: {
      //   // 静态引入示例
      //   'supos-ce/CodeManagement': {
      //     type: 'module',
      //     name: 'supos-ce/CodeManagement',
      //     entry: 'http://100.100.100.22:33993/plugin/CodeManagement/mf-manifest.json',
      //   },
      // },
      exposes: {
        './components': './src/components/index.ts',
        './utils': './src/utils/index.ts',
        './hooks': './src/hooks/index.ts',
        './apis': './src/apis/inter-api/index.ts',
        './button-permission': './src/common-types/button-permission.ts',
        './constans': './src/common-types/constans.ts',
        './i18nStore': './src/stores/i18n-store.ts',
        './baseStore': './src/stores/base/index.ts',
        './tabs-lifecycle-context': './src/contexts/tabs-lifecycle-context.ts',
      },
      shared: {
        react: {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
        'react-dom': {
          singleton: true,
          requiredVersion: '^18.3.1',
        },
        'react-router-dom': {
          singleton: true,
          requiredVersion: '^6.27.0',
        },
        antd: {
          singleton: true,
          requiredVersion: '^5.25.2',
        },
        '@ant-design/icons': {
          singleton: true,
          requiredVersion: '^5.5.2',
        },
        ahooks: {
          singleton: true,
          requiredVersion: '^3.8.5',
        },
        '@carbon/icons-react': {
          singleton: true,
          requiredVersion: '^11.60.0',
        },
        lodash: {
          singleton: true,
          requiredVersion: '^4.17.21',
        },
        sass: {
          singleton: true,
          requiredVersion: '^1.80.4',
        },
      },
    }),
  ],
  css: {
    preprocessorOptions: {
      scss: {
        includePaths: ['node_modules'],
        // javascriptEnabled: true,
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
    extensions: ['.mjs', '.js', '.ts', '.jsx', '.tsx'],
  },
  define: {
    'process.env': { ...devInfo },
    'import.meta.env.VITE_APP_VERSION': JSON.stringify(packageJson.version),
    'import.meta.env.VITE_APP_BUILD_TIMESTAMP': JSON.stringify(buildTime),
  },
  envPrefix: ['REACT_APP_', 'VITE_', 'OPENAI_'],
  server: {
    origin: devInfo.VITE_ASSET_PREFIX,
    proxy: {
      ...proxy,
      // '/copilotkit': 'http://localhost:4000',
      ...(devInfo.VITE_ASSET_PREFIX !== '1'
        ? {
            '/plugin/': {
              target: devInfo.API_PROXY_URL,
              changeOrigin: true,
            },
          }
        : {
            '/mf-manifest.json': devInfo.VITE_ASSET_PREFIX,
          }),
    },
  },
  build: {
    outDir: 'build', // 设置构建输出目录为 build
    target: ['chrome89', 'edge89', 'firefox89', 'safari15'],
  },
});
