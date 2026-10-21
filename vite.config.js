import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const port = Number(env.PORT || env.VITE_PORT || 3000);

  return {
    plugins: [react()],
    server: {
      port,
      host: env.VITE_HOST ? (env.VITE_HOST === 'true' ? true : env.VITE_HOST) : false,
      open: false
    },
    preview: {
      port: Number(env.PREVIEW_PORT || env.VITE_PREVIEW_PORT || port),
      host: env.VITE_HOST ? (env.VITE_HOST === 'true' ? true : env.VITE_HOST) : false
    },
    build: {
      chunkSizeWarningLimit: 600,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-react': ['react', 'react-dom', 'react-router-dom'],
            'vendor-supabase': ['@supabase/supabase-js'],
            'vendor-xlsx': ['xlsx']
          }
        }
      }
    }
  };
});
