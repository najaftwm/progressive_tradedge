import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@components': path.resolve(__dirname, 'src/components'),
      '@common': path.resolve(__dirname, 'src/components/common'),
      '@filters': path.resolve(__dirname, 'src/components/filters'),
      '@store': path.resolve(__dirname, 'src/store'),
      '@api': path.resolve(__dirname, 'src/api'),
      '@context': path.resolve(__dirname, 'src/context'),
      '@images': path.resolve(__dirname, 'src/images'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@financepage': path.resolve(__dirname, 'src/components/FinancePage'),
      '@masterpage': path.resolve(__dirname, 'src/components/MasterPage'),
    },
  },
  server: {
    port: 49000, 
    host: true,  
  },
});
