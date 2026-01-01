/**
 * Bundle Size Analysis Configuration
 * 
 * This file can be used with tools like:
 * - vite-bundle-visualizer
 * - rollup-plugin-visualizer
 * 
 * Usage:
 * 1. Install: npm install --save-dev rollup-plugin-visualizer
 * 2. Import and add to vite.config.ts plugins
 */

import { visualizer } from 'rollup-plugin-visualizer';

export const bundleAnalyzer = visualizer({
  filename: './dist/stats.html',
  open: true,
  gzipSize: true,
  brotliSize: true,
});

