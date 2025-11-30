import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  plugins: [
    react(),
    tailwindcss()
  ],
  // Configuracion para produccion
  build: {
    outDir: 'dist',
    sourcemap: false, // Deshabilita los sourcemaps para producción
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
        },
      },
    },
  },

  /* Configuracion de alias */
  resolve: { 
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
})
