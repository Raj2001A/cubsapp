export {};
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    port: 3000,
    host: true,
    strictPort: true,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000,
      clientPort: 3000
    },
    // Proxy configuration for local development
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/ws': {
        target: 'ws://localhost:3000',
        ws: true,
        changeOrigin: true,
        secure: false
      }
    }
  },
  define: {
    // Comprehensive environment variable handling
    'process.env': {
      // Firebase configuration
      FIREBASE_API_KEY: JSON.stringify('AIzaSyDummyKeyForTesting123456789'),
      FIREBASE_AUTH_DOMAIN: JSON.stringify('dummy-project.firebaseapp.com'),
      FIREBASE_PROJECT_ID: JSON.stringify('dummy-project'),
      FIREBASE_STORAGE_BUCKET: JSON.stringify('dummy-project.appspot.com'),
      FIREBASE_MESSAGING_SENDER_ID: JSON.stringify('123456789012'),
      FIREBASE_APP_ID: JSON.stringify('1:123456789012:web:abcdef1234567890'),

      // Application environment
      NODE_ENV: JSON.stringify('development'),

      // Feature flags
      ENABLE_PWA: JSON.stringify('true'),
      USE_FIREBASE_EMULATORS: JSON.stringify('false')
    }
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@components': path.resolve(__dirname, './src/components'),
      '@pages': path.resolve(__dirname, './src/pages'),
      '@services': path.resolve(__dirname, './src/services'),
      '@utils': path.resolve(__dirname, './src/utils'),
      '@types': path.resolve(__dirname, './src/types'),
      '@assets': path.resolve(__dirname, './src/assets'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          ui: ['@headlessui/react', '@heroicons/react', 'lucide-react'],
          utils: ['axios', 'date-fns', 'react-toastify', 'zustand'],
        },
      },
    },
  },
});
