import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

/**
 * Vite configuration with CDN support.
 * 
 * To use CDN:
 * 1. Set VITE_CDN_URL environment variable
 * 2. Build: VITE_CDN_URL=https://cdn.example.com npm run build
 * 
 * CDN URL should be the base URL where assets will be hosted.
 * Example: https://resonantgraph-assets.nyc3.cdn.digitalocean.com
 */
export default defineConfig({
  plugins: [react()],
  
  // Use CDN URL as base if provided, otherwise use root
  base: process.env.VITE_CDN_URL || '/',
  
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  
  build: {
    // Output directory
    outDir: 'dist',
    
    // Assets directory
    assetsDir: 'assets',
    
    // Source maps (disable in production for smaller builds)
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Minification
    minify: 'terser',
    
    // Chunk size warning limit (500kb)
    chunkSizeWarningLimit: 500,
    
    rollupOptions: {
      output: {
        // Use CDN URL for assets if provided
        assetFileNames: (assetInfo) => {
          const cdnUrl = process.env.VITE_CDN_URL;
          const hash = '[hash]';
          const ext = assetInfo.name?.split('.').pop() || '';
          
          // For CDN, use full URL path
          if (cdnUrl) {
            // Remove trailing slash if present
            const baseUrl = cdnUrl.replace(/\/$/, '');
            return `${baseUrl}/assets/[name]-${hash}.${ext}`;
          }
          
          // Local build - standard path
          return `assets/[name]-${hash}.${ext}`;
        },
        
        // Chunk file names
        chunkFileNames: (chunkInfo) => {
          const cdnUrl = process.env.VITE_CDN_URL;
          if (cdnUrl) {
            const baseUrl = cdnUrl.replace(/\/$/, '');
            return `${baseUrl}/assets/[name]-[hash].js`;
          }
          return 'assets/[name]-[hash].js';
        },
        
        // Entry file names
        entryFileNames: 'assets/[name]-[hash].js',
        
        // Manual chunks for better caching
        manualChunks: (id) => {
          // Vendor chunks
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'vendor-react';
            }
            if (id.includes('axios')) {
              return 'vendor-axios';
            }
            if (id.includes('recharts') || id.includes('echarts')) {
              return 'vendor-charts';
            }
            return 'vendor';
          }
        },
      },
    },
    
    // Compression
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
      },
    },
  },
  
  // Server configuration (development)
  server: {
    port: 5173,
    host: true,
  },
  
  // Preview configuration
  preview: {
    port: 4173,
    host: true,
  },
});

