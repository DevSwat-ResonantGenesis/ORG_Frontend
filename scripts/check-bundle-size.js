#!/usr/bin/env node

/**
 * Bundle Size Check Script
 * Checks if bundle sizes are within performance budgets
 */

import { readFileSync, statSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const distDir = join(__dirname, '../dist');

// Performance budgets (in bytes)
const budgets = {
  initial: {
    js: 200 * 1024,      // 200KB
    css: 50 * 1024,      // 50KB
    total: 250 * 1024,   // 250KB
  },
  total: {
    js: 500 * 1024,      // 500KB
    css: 100 * 1024,     // 100KB
    total: 600 * 1024,   // 600KB
  },
  chunks: {
    vendor: 200 * 1024,  // 200KB
    main: 150 * 1024,    // 150KB
  },
};

function formatBytes(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function getFileSize(filePath) {
  try {
    const stats = statSync(filePath);
    return stats.size;
  } catch (error) {
    return 0;
  }
}

function checkBundleSize() {
  console.log('📦 Checking bundle sizes...\n');

  let totalJS = 0;
  let totalCSS = 0;
  let hasErrors = false;

  // Check all JS files
  try {
    const files = readFileSync(join(distDir, 'index.html'), 'utf-8');
    const jsMatches = files.match(/<script[^>]+src="([^"]+\.js)"/g) || [];
    const cssMatches = files.match(/<link[^>]+href="([^"]+\.css)"/g) || [];

    jsMatches.forEach((match) => {
      const src = match.match(/src="([^"]+)"/)[1];
      const filePath = join(distDir, src.replace(/^\//, ''));
      const size = getFileSize(filePath);
      totalJS += size;
      console.log(`  JS: ${src} - ${formatBytes(size)}`);
    });

    cssMatches.forEach((match) => {
      const href = match.match(/href="([^"]+)"/)[1];
      const filePath = join(distDir, href.replace(/^\//, ''));
      const size = getFileSize(filePath);
      totalCSS += size;
      console.log(`  CSS: ${href} - ${formatBytes(size)}`);
    });
  } catch (error) {
    console.error('❌ Error reading dist files:', error.message);
    console.log('\n💡 Run "npm run build" first to generate dist folder');
    process.exit(1);
  }

  // Check chunk files
  try {
    const fs = await import('fs/promises');
    const files = await fs.readdir(distDir);
    const jsFiles = files.filter(f => f.endsWith('.js') && f !== 'index.html');
    const cssFiles = files.filter(f => f.endsWith('.css'));

    jsFiles.forEach(file => {
      const size = getFileSize(join(distDir, file));
      totalJS += size;
      console.log(`  Chunk: ${file} - ${formatBytes(size)}`);
    });

    cssFiles.forEach(file => {
      const size = getFileSize(join(distDir, file));
      totalCSS += size;
      console.log(`  CSS: ${file} - ${formatBytes(size)}`);
    });
  } catch (error) {
    // Ignore if dist doesn't exist
  }

  const total = totalJS + totalCSS;

  console.log('\n📊 Summary:');
  console.log(`  Total JS: ${formatBytes(totalJS)} (Budget: ${formatBytes(budgets.total.js)})`);
  console.log(`  Total CSS: ${formatBytes(totalCSS)} (Budget: ${formatBytes(budgets.total.css)})`);
  console.log(`  Total: ${formatBytes(total)} (Budget: ${formatBytes(budgets.total.total)})`);

  // Check budgets
  if (totalJS > budgets.total.js) {
    console.log(`\n⚠️  JS bundle exceeds budget by ${formatBytes(totalJS - budgets.total.js)}`);
    hasErrors = true;
  }

  if (totalCSS > budgets.total.css) {
    console.log(`\n⚠️  CSS bundle exceeds budget by ${formatBytes(totalCSS - budgets.total.css)}`);
    hasErrors = true;
  }

  if (total > budgets.total.total) {
    console.log(`\n⚠️  Total bundle exceeds budget by ${formatBytes(total - budgets.total.total)}`);
    hasErrors = true;
  }

  if (!hasErrors) {
    console.log('\n✅ All bundle sizes are within budget!');
    process.exit(0);
  } else {
    console.log('\n❌ Bundle size check failed');
    process.exit(1);
  }
}

checkBundleSize();

