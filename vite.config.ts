import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import path from 'path';

export default defineConfig({
  plugins: [
    react(), 
    // Bundle analyzer - only in production builds when ANALYZE=true
    process.env.ANALYZE && visualizer({
      filename: './dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5175,
    host: true,
    strictPort: true,
    hmr: {
      port: 5175,
      protocol: 'ws',
      host: 'localhost'
    },
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    proxy: {
      // WebSocket proxy for real-time updates
      '/ws': {
        target: 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
      // IDE service routes
      '/ide': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // Proxy all API requests to backend - makes cookies work (same-origin)
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('proxy error', err);
          });
          proxy.on('proxyReq', (proxyReq, req, res) => {
            console.log('Sending Request to the Target:', req.method, req.url);
          });
          proxy.on('proxyRes', (proxyRes, req, res) => {
            console.log('Received Response from the Target:', proxyRes.statusCode, req.url);
          });
        },
      },
      '/agent-teams': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('agent-teams proxy error', err);
          });
        },
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('auth proxy error', err);
          });
        },
      },
      // NOTE: /public is NOT proxied - it's used by React Router for frontend pages
      // Backend public endpoints should be accessed via /api/public/*
      // NOTE: /agents is NOT proxied - it's used by React Router for AgentOS frontend
      // Backend agent endpoints should be accessed via /api/v1/agents/*
      '/billing': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('billing proxy error', err);
          });
        },
      },
      '/user': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/orgs': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/resonant-chat': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('resonant-chat proxy error', err);
          });
        },
      },
      '/hash-sphere': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('hash-sphere proxy error', err);
          });
        },
      },
      '/rag': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.log('rag proxy error', err);
          });
        },
      },
      '/settings': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/admin': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ml': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/code': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/git': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/github': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/marketplace': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/usage': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/policies': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/compliance': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/audit': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/predict': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ai-agent': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ai': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/finance': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/users': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  preview: {
    port: 5175,
    strictPort: true
  },
  define: {
    // Use empty string to leverage Vite proxy - DO NOT set to localhost:8000
    // The proxy handles routing to backend, making cookies work (same-origin)
    'import.meta.env.VITE_FASTAPI_URL': JSON.stringify(process.env.VITE_FASTAPI_URL || ''),
    'import.meta.env.VITE_API_URL': JSON.stringify(process.env.VITE_API_URL || '')
  },
  build: {
    chunkSizeWarningLimit: 2000,
    sourcemap: false,
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'],
      },
    },
  },
});
