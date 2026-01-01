import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface BackendStatus {
  running: boolean;
  port: number;
  pid?: number;
  url?: string;
}

export class BackendService {
  private backendProcess: ChildProcess | null = null;
  private backendPath: string;
  private port: number = 8001;

  constructor(backendPath?: string) {
    // Default backend path
    this.backendPath = backendPath || this.detectBackendPath();
  }

  private detectBackendPath(): string {
    // Try to find backend in common locations
    const possiblePaths = [
      '/Applications/ResonantGraphAIV0.1',
      path.join(process.cwd(), '..', 'ResonantGraphAIV0.1'),
      path.join(require('os').homedir(), 'Documents', 'ResonantGraphAIV0.1'),
    ];

    for (const backendPath of possiblePaths) {
      const dockerComposePath = path.join(backendPath, 'docker-compose.yml');
      if (fs.existsSync(dockerComposePath)) {
        return backendPath;
      }
    }

    // Fallback to default
    return '/Applications/ResonantGraphAIV0.1';
  }

  /**
   * Check if backend is running
   */
  async checkStatus(): Promise<BackendStatus> {
    try {
      const http = require('http');
      return new Promise((resolve) => {
        const req = http.get(`http://localhost:${this.port}/health`, (res: any) => {
          if (res.statusCode === 200) {
            resolve({
              running: true,
              port: this.port,
              url: `http://localhost:${this.port}`,
            });
          } else {
            resolve({ running: false, port: this.port });
          }
        });

        req.on('error', () => {
          resolve({ running: false, port: this.port });
        });

        req.setTimeout(2000, () => {
          req.destroy();
          resolve({ running: false, port: this.port });
        });
      });
    } catch (error) {
      return { running: false, port: this.port };
    }
  }

  /**
   * Start backend using Docker Compose
   */
  async startWithDocker(): Promise<{ success: boolean; message: string }> {
    try {
      // Check if Docker is available
      const dockerAvailable = await this.checkDocker();
      if (!dockerAvailable) {
        return {
          success: false,
          message: 'Docker is not running. Please start Docker Desktop.',
        };
      }

      // Check if backend path exists
      if (!fs.existsSync(this.backendPath)) {
        return {
          success: false,
          message: `Backend path not found: ${this.backendPath}`,
        };
      }

      // Start docker compose
      const dockerComposePath = path.join(this.backendPath, 'docker-compose.yml');
      if (!fs.existsSync(dockerComposePath)) {
        return {
          success: false,
          message: `docker-compose.yml not found at: ${dockerComposePath}`,
        };
      }

      return new Promise((resolve) => {
        const dockerCompose = spawn('docker', ['compose', 'up', '-d'], {
          cwd: this.backendPath,
          stdio: 'pipe',
        });

        let output = '';
        dockerCompose.stdout?.on('data', (data) => {
          output += data.toString();
        });

        dockerCompose.stderr?.on('data', (data) => {
          output += data.toString();
        });

        dockerCompose.on('close', (code) => {
          if (code === 0) {
            resolve({
              success: true,
              message: 'Backend started successfully',
            });
          } else {
            resolve({
              success: false,
              message: `Failed to start backend: ${output}`,
            });
          }
        });

        dockerCompose.on('error', (error) => {
          resolve({
            success: false,
            message: `Failed to start Docker: ${error.message}`,
          });
        });
      });
    } catch (error: any) {
      return {
        success: false,
        message: `Error starting backend: ${error.message}`,
      };
    }
  }

  /**
   * Stop backend Docker containers
   */
  async stopDocker(): Promise<{ success: boolean; message: string }> {
    try {
      return new Promise((resolve) => {
        const dockerCompose = spawn('docker', ['compose', 'down'], {
          cwd: this.backendPath,
          stdio: 'pipe',
        });

        let output = '';
        dockerCompose.stdout?.on('data', (data) => {
          output += data.toString();
        });

        dockerCompose.stderr?.on('data', (data) => {
          output += data.toString();
        });

        dockerCompose.on('close', (code) => {
          resolve({
            success: code === 0,
            message: code === 0 ? 'Backend stopped successfully' : `Failed to stop: ${output}`,
          });
        });

        dockerCompose.on('error', (error) => {
          resolve({
            success: false,
            message: `Error stopping backend: ${error.message}`,
          });
        });
      });
    } catch (error: any) {
      return {
        success: false,
        message: `Error stopping backend: ${error.message}`,
      };
    }
  }

  /**
   * Check if Docker is available
   */
  private async checkDocker(): Promise<boolean> {
    return new Promise((resolve) => {
      const docker = spawn('docker', ['--version']);
      docker.on('close', (code) => {
        resolve(code === 0);
      });
      docker.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Get backend path
   */
  getBackendPath(): string {
    return this.backendPath;
  }

  /**
   * Set backend path
   */
  setBackendPath(path: string): void {
    if (fs.existsSync(path)) {
      this.backendPath = path;
    }
  }
}

// Note: app will be imported when this service is used in main.ts

