import path from 'path';

import react from '@vitejs/plugin-react-swc';
import { defineConfig, loadEnv } from 'vite';

/** Порт dev-сервера: у web-client 8080 и 5211–5213, у галерей 5230+. */
const DEV_PORT = 5300;
/** team-api локально (`npm run team-api` в easyapps-web-server). */
const DEFAULT_PROXY_TARGET = 'http://localhost:3100';

/** Крупные библиотеки — отдельными чанками: кэшируются между выкладками. */
const VENDOR_CHUNKS: Record<string, string[]> = {
  react: ['react', 'react-dom', 'react-router-dom', 'scheduler'],
  // Мелкие утилиты классов — своим чанком: их тянут и графики (recharts → clsx),
  // и без явного места rollup кладёт их в charts — и графики грузятся на старте.
  classnames: ['clsx', 'tailwind-merge', 'class-variance-authority'],
  query: ['@tanstack/react-query', 'axios'],
  ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu', '@radix-ui/react-popover', '@radix-ui/react-tooltip', 'vaul', 'cmdk'],
  motion: ['framer-motion'],
  charts: ['recharts'],
  dnd: ['@dnd-kit/core', '@dnd-kit/sortable', '@dnd-kit/utilities'],
  markdown: ['react-markdown', 'remark-gfm'],
};

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const proxyTarget = env.VITE_PROXY_TARGET || DEFAULT_PROXY_TARGET;
  // Для разработки против боевого API: тот пускает изменения только со своего фронта.
  const proxyOrigin = env.VITE_PROXY_ORIGIN;

  return {
    server: {
      host: '::',
      port: DEV_PORT,
      strictPort: true,
      proxy: {
        '/api': {
          target: proxyTarget,
          changeOrigin: true,
          secure: false,
          cookieDomainRewrite: 'localhost',
          configure: (proxy) => {
            if (!proxyOrigin) return;
            proxy.on('proxyReq', (proxyReq) => proxyReq.setHeader('origin', proxyOrigin));
          },
        },
      },
    },
    plugins: [react()],
    resolve: {
      alias: { '@': path.resolve(__dirname, './src') },
    },
    build: {
      target: 'es2020',
      cssCodeSplit: true,
      sourcemap: mode === 'development',
      rollupOptions: {
        output: { manualChunks: VENDOR_CHUNKS },
      },
    },
  };
});
