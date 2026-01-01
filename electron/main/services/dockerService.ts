import { spawn, ChildProcess } from 'child_process';

export interface DockerContainer {
  id: string;
  name: string;
  image: string;
  status: string;
  ports: string[];
}

export interface DockerStatus {
  available: boolean;
  running: boolean;
  version?: string;
}

export class DockerService {
  /**
   * Check if Docker is installed and running
   */
  async checkDockerStatus(): Promise<DockerStatus> {
    try {
      // Check if Docker is installed
      const version = await this.getDockerVersion();
      if (!version) {
        return { available: false, running: false };
      }

      // Check if Docker daemon is running
      const running = await this.isDockerRunning();
      
      return {
        available: true,
        running,
        version,
      };
    } catch (error) {
      return { available: false, running: false };
    }
  }

  /**
   * Get Docker version
   */
  private async getDockerVersion(): Promise<string | null> {
    return new Promise((resolve) => {
      const docker = spawn('docker', ['--version']);
      let output = '';

      docker.stdout?.on('data', (data) => {
        output += data.toString();
      });

      docker.on('close', (code) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          resolve(null);
        }
      });

      docker.on('error', () => {
        resolve(null);
      });
    });
  }

  /**
   * Check if Docker daemon is running
   */
  private async isDockerRunning(): Promise<boolean> {
    return new Promise((resolve) => {
      const docker = spawn('docker', ['info']);
      
      docker.on('close', (code) => {
        resolve(code === 0);
      });

      docker.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * List running containers
   */
  async listContainers(): Promise<DockerContainer[]> {
    return new Promise((resolve, reject) => {
      const docker = spawn('docker', [
        'ps',
        '--format',
        '{{.ID}}\t{{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}',
      ]);

      let output = '';
      docker.stdout?.on('data', (data) => {
        output += data.toString();
      });

      docker.stderr?.on('data', (data) => {
        // Ignore stderr for now
      });

      docker.on('close', (code) => {
        if (code !== 0) {
          resolve([]);
          return;
        }

        const containers: DockerContainer[] = [];
        const lines = output.trim().split('\n').filter((line) => line.trim());

        for (const line of lines) {
          const parts = line.split('\t');
          if (parts.length >= 4) {
            containers.push({
              id: parts[0],
              name: parts[1],
              image: parts[2],
              status: parts[3],
              ports: parts[4] ? parts[4].split(', ') : [],
            });
          }
        }

        resolve(containers);
      });

      docker.on('error', () => {
        resolve([]);
      });
    });
  }

  /**
   * Start a container
   */
  async startContainer(containerId: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const docker = spawn('docker', ['start', containerId]);
      let output = '';

      docker.stdout?.on('data', (data) => {
        output += data.toString();
      });

      docker.stderr?.on('data', (data) => {
        output += data.toString();
      });

      docker.on('close', (code) => {
        resolve({
          success: code === 0,
          message: code === 0 ? 'Container started' : output || 'Failed to start container',
        });
      });

      docker.on('error', (error) => {
        resolve({
          success: false,
          message: `Error: ${error.message}`,
        });
      });
    });
  }

  /**
   * Stop a container
   */
  async stopContainer(containerId: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const docker = spawn('docker', ['stop', containerId]);
      let output = '';

      docker.stdout?.on('data', (data) => {
        output += data.toString();
      });

      docker.stderr?.on('data', (data) => {
        output += data.toString();
      });

      docker.on('close', (code) => {
        resolve({
          success: code === 0,
          message: code === 0 ? 'Container stopped' : output || 'Failed to stop container',
        });
      });

      docker.on('error', (error) => {
        resolve({
          success: false,
          message: `Error: ${error.message}`,
        });
      });
    });
  }

  /**
   * Restart a container
   */
  async restartContainer(containerId: string): Promise<{ success: boolean; message: string }> {
    return new Promise((resolve) => {
      const docker = spawn('docker', ['restart', containerId]);
      let output = '';

      docker.stdout?.on('data', (data) => {
        output += data.toString();
      });

      docker.stderr?.on('data', (data) => {
        output += data.toString();
      });

      docker.on('close', (code) => {
        resolve({
          success: code === 0,
          message: code === 0 ? 'Container restarted' : output || 'Failed to restart container',
        });
      });

      docker.on('error', (error) => {
        resolve({
          success: false,
          message: `Error: ${error.message}`,
        });
      });
    });
  }

  /**
   * Get container logs
   */
  async getContainerLogs(containerId: string, lines: number = 100): Promise<string> {
    return new Promise((resolve) => {
      const docker = spawn('docker', ['logs', '--tail', lines.toString(), containerId]);
      let output = '';

      docker.stdout?.on('data', (data) => {
        output += data.toString();
      });

      docker.stderr?.on('data', (data) => {
        output += data.toString();
      });

      docker.on('close', () => {
        resolve(output);
      });

      docker.on('error', () => {
        resolve('');
      });
    });
  }
}

