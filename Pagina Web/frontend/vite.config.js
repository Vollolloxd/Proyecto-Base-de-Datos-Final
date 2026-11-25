// Configuracion de Vite: en desarrollo /api se redirige al backend
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    build: { chunkSizeWarningLimit: 1000 },
    plugins: [react()],
    server: {
        port: 5173,
        watch: process.env.VITE_POLLING ? { usePolling: true, interval: 300 } : undefined,
        proxy: {
            '/api': process.env.API_URL || 'http://localhost:3001'
        }
    }
});
