import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => {
  return {
    base: '/',
    plugins: [react()],
    // ✅ Đã xóa: GEMINI_API_KEY không được bundle vào client nữa
    // API key chỉ dùng trên server (server.ts)
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
    },
  };
});
