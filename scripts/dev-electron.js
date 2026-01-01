#!/usr/bin/env node

/**
 * Development script that runs both Vite and Electron
 * Waits for Vite to be ready before starting Electron
 */

const { spawn } = require('child_process');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

let viteProcess = null;
let electronProcess = null;

async function waitForServer(url, maxAttempts = 30) {
  const http = require('http');
  
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    try {
      await new Promise((resolve, reject) => {
        const req = http.get(url, (res) => {
          resolve();
        });
        req.on('error', reject);
        req.setTimeout(1000, () => reject(new Error('Timeout')));
      });
      
      console.log('✅ Vite dev server is ready!');
      return true;
    } catch (error) {
      process.stdout.write('.');
    }
  }
  
  return false;
}

async function buildElectron() {
  console.log('🔨 Building Electron main process...');
  try {
    await execAsync('npm run electron:build');
    console.log('✅ Electron build complete');
    return true;
  } catch (error) {
    console.error('❌ Electron build failed:', error.message);
    return false;
  }
}

function startVite() {
  console.log('🚀 Starting Vite dev server...');
  viteProcess = spawn('npm', ['run', 'dev'], {
    stdio: 'inherit',
    shell: true,
  });

  viteProcess.on('error', (error) => {
    console.error('❌ Failed to start Vite:', error);
    cleanup();
    process.exit(1);
  });

  return viteProcess;
}

async function startElectron() {
  console.log('⚡ Starting Electron...');
  electronProcess = spawn('npm', ['run', 'electron:start'], {
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, NODE_ENV: 'development' },
  });

  electronProcess.on('error', (error) => {
    console.error('❌ Failed to start Electron:', error);
    cleanup();
    process.exit(1);
  });

  electronProcess.on('exit', () => {
    console.log('👋 Electron exited');
    cleanup();
  });
}

function cleanup() {
  if (viteProcess) {
    viteProcess.kill();
    viteProcess = null;
  }
  if (electronProcess) {
    electronProcess.kill();
    electronProcess = null;
  }
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down...');
  cleanup();
  process.exit(0);
});

process.on('SIGTERM', () => {
  cleanup();
  process.exit(0);
});

// Main execution
(async () => {
  // Build Electron first
  const buildSuccess = await buildElectron();
  if (!buildSuccess) {
    process.exit(1);
  }

  // Start Vite
  startVite();

  // Wait for Vite to be ready
  console.log('⏳ Waiting for Vite dev server...');
  const serverReady = await waitForServer('http://localhost:5175');
  
  if (!serverReady) {
    console.error('❌ Vite dev server did not start in time');
    cleanup();
    process.exit(1);
  }

  // Start Electron
  await startElectron();
})();

