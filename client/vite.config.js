import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'strip-broken-sourcemaps',
      transform(code, id) {
        if (id.includes('node_modules')) {
          return {
            code: code.replace(/\/\/# sourceMappingURL=.*/g, ''),
            map: null,
          };
        }
      },
    },
  ],
  esbuild: {
    sourcemap: false,
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://localhost:5001',
        changeOrigin: true,
      },
    },
  },
});
