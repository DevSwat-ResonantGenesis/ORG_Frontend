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
      },
      '/auth': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      // NOTE: /public is NOT proxied - it's used by React Router for frontend pages
      // Backend public endpoints should be accessed via /api/public/*
      // NOTE: /agents is NOT proxied - it's used by React Router for AgentOS frontend
      // Backend agent endpoints should be accessed via /api/v1/agents/*
      '/billing': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
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
      },
      '/hash-sphere': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/rag': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
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
      '/agent-teams': {
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
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          // Split vendor libraries into logical chunks for better caching and loading
          
          // React core - keep all React packages together to avoid initialization issues
          if (id.includes('node_modules/react/') || 
              id.includes('node_modules/react-dom/') ||
              id.includes('node_modules/scheduler/') ||
              id.includes('node_modules/react-is/') ||
              id.includes('node_modules/use-sync-external-store/')) {
            return 'vendor-react';
          }
          
          // React Router - separate chunk
          if (id.includes('node_modules/react-router')) {
            return 'vendor-router';
          }
          
          // ECharts - separate chunk (largest library, ~800KB, loaded on-demand)
          if (id.includes('node_modules/echarts')) {
            return 'echarts-vendor';
          }
          
          // Recharts - separate chunk (charting library)
          if (id.includes('node_modules/recharts')) {
            return 'vendor-recharts';
          }
          
          // UI libraries - separate chunk
          if (id.includes('node_modules/@tanstack/react-table') || 
              id.includes('node_modules/cytoscape') ||
              id.includes('node_modules/zustand')) {
            return 'ui-vendor';
          }
          
          // Axios and HTTP libraries
          if (id.includes('node_modules/axios')) {
            return 'vendor-http';
          }
          
          // Markdown and syntax highlighting
          if (id.includes('node_modules/react-markdown') || 
              id.includes('node_modules/react-syntax-highlighter') ||
              id.includes('node_modules/prismjs') ||
              id.includes('node_modules/remark') ||
              id.includes('node_modules/rehype')) {
            return 'vendor-markdown';
          }
          
          // Sentry (monitoring)
          if (id.includes('node_modules/@sentry')) {
            return 'vendor-monitoring';
          }
          
          // Large utility libraries
          if (id.includes('node_modules/html2canvas')) {
            return 'vendor-utils';
          }
          
          // Monaco Editor - separate chunk (large editor library)
          if (id.includes('node_modules/monaco-editor') || id.includes('node_modules/@monaco-editor')) {
            return 'vendor-monaco';
          }
          
          // Date libraries
          if (id.includes('node_modules/date-fns') || id.includes('node_modules/dayjs') || id.includes('node_modules/moment')) {
            return 'vendor-date';
          }
          
          // Form libraries
          if (id.includes('node_modules/react-hook-form') || id.includes('node_modules/formik') || id.includes('node_modules/yup') || id.includes('node_modules/zod')) {
            return 'vendor-forms';
          }
          
          // Animation libraries
          if (id.includes('node_modules/framer-motion') || id.includes('node_modules/react-spring')) {
            return 'vendor-animation';
          }
          
          // All other vendors - split by size
          if (id.includes('node_modules')) {
            return 'vendor';
          }
          
          // AgentOS Panel splitting - each panel loads independently
          if (id.includes('src/pages/Agents/components/Panels/AgentsPanel')) {
            return 'panel-agents';
          }
          if (id.includes('src/pages/Agents/components/Panels/FactoryPanel')) {
            return 'panel-factory';
          }
          if (id.includes('src/pages/Agents/components/Panels/WorkflowPanel')) {
            return 'panel-workflow';
          }
          if (id.includes('src/pages/Agents/components/Panels/EconomyPanel')) {
            return 'panel-economy';
          }
          
          // AgentOS stores - separate chunk for state management
          if (id.includes('src/stores/')) {
            return 'agentos-stores';
          }
          
          // Observability layer
          if (id.includes('src/observability/')) {
            return 'agentos-observability';
          }
          
          // Security layer
          if (id.includes('src/security/')) {
            return 'agentos-security';
          }
        },
      },
    },
    chunkSizeWarningLimit: 1000, // Allow larger chunks to avoid splitting React
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug'], // Remove specific console methods
      },
    },
  },
});
