import { spawn, ChildProcess } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';

export interface LSPServer {
  id: string;
  language: string;
  command: string;
  args: string[];
  process?: ChildProcess;
  port?: number;
  status: 'stopped' | 'starting' | 'running' | 'error';
}

export class LSPService {
  private servers: Map<string, LSPServer> = new Map();
  private serverPorts: Map<string, number> = new Map();
  private nextPort: number = 6000;

  constructor() {
    this.initializeDefaultServers();
  }

  /**
   * Initialize default LSP servers
   */
  private initializeDefaultServers(): void {
    // TypeScript/JavaScript
    this.servers.set('typescript', {
      id: 'typescript',
      language: 'typescript',
      command: 'typescript-language-server',
      args: ['--stdio'],
      status: 'stopped',
    });

    this.servers.set('javascript', {
      id: 'javascript',
      language: 'javascript',
      command: 'typescript-language-server',
      args: ['--stdio'],
      status: 'stopped',
    });

    // Python
    this.servers.set('python', {
      id: 'python',
      language: 'python',
      command: 'pylsp',
      args: [],
      status: 'stopped',
    });

    // JSON
    this.servers.set('json', {
      id: 'json',
      language: 'json',
      command: 'vscode-json-languageserver',
      args: ['--stdio'],
      status: 'stopped',
    });
  }

  /**
   * Check if an LSP server is installed
   */
  async checkServerInstalled(serverId: string): Promise<boolean> {
    const server = this.servers.get(serverId);
    if (!server) {
      return false;
    }

    return new Promise((resolve) => {
      // Check if command exists
      const which = process.platform === 'win32' ? 'where' : 'which';
      const check = spawn(which, [server.command]);

      check.on('close', (code) => {
        resolve(code === 0);
      });

      check.on('error', () => {
        resolve(false);
      });
    });
  }

  /**
   * Start an LSP server
   */
  async startServer(serverId: string): Promise<{ success: boolean; message: string; port?: number }> {
    const server = this.servers.get(serverId);
    if (!server) {
      return { success: false, message: `Server ${serverId} not found` };
    }

    if (server.status === 'running') {
      return { success: true, message: 'Server already running', port: server.port };
    }

    // Check if server is installed
    const installed = await this.checkServerInstalled(serverId);
    if (!installed) {
      return {
        success: false,
        message: `${server.command} is not installed. Please install it first.`,
      };
    }

    try {
      server.status = 'starting';
      
      // For stdio servers, we'll use a wrapper that communicates via stdio
      // For TCP servers, assign a port
      const port = this.nextPort++;
      this.serverPorts.set(serverId, port);

      // Spawn the LSP server process
      const lspProcess = spawn(server.command, server.args, {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      server.process = lspProcess;
      server.port = port;

      lspProcess.on('error', (error) => {
        server.status = 'error';
        console.error(`LSP server ${serverId} error:`, error);
      });

      lspProcess.on('exit', (code) => {
        server.status = 'stopped';
        server.process = undefined;
        console.log(`LSP server ${serverId} exited with code ${code}`);
      });

      // Wait a bit to see if it starts successfully
      await new Promise((resolve) => setTimeout(resolve, 1000));

      if (lspProcess.killed || !lspProcess.pid) {
        server.status = 'error';
        return { success: false, message: 'Failed to start LSP server' };
      }

      server.status = 'running';
      return { success: true, message: 'LSP server started', port };
    } catch (error: any) {
      server.status = 'error';
      return { success: false, message: `Error starting server: ${error.message}` };
    }
  }

  /**
   * Stop an LSP server
   */
  async stopServer(serverId: string): Promise<{ success: boolean; message: string }> {
    const server = this.servers.get(serverId);
    if (!server) {
      return { success: false, message: `Server ${serverId} not found` };
    }

    if (server.status !== 'running' || !server.process) {
      return { success: true, message: 'Server not running' };
    }

    try {
      server.process.kill();
      server.status = 'stopped';
      server.process = undefined;
      this.serverPorts.delete(serverId);
      return { success: true, message: 'Server stopped' };
    } catch (error: any) {
      return { success: false, message: `Error stopping server: ${error.message}` };
    }
  }

  /**
   * Get server status
   */
  getServerStatus(serverId: string): LSPServer | null {
    return this.servers.get(serverId) || null;
  }

  /**
   * List all servers
   */
  listServers(): LSPServer[] {
    return Array.from(this.servers.values());
  }

  /**
   * Get server process for direct communication
   */
  getServerProcess(serverId: string): ChildProcess | null {
    const server = this.servers.get(serverId);
    return server?.process || null;
  }

  /**
   * Stop all servers
   */
  async stopAllServers(): Promise<void> {
    const promises = Array.from(this.servers.keys()).map((id) => this.stopServer(id));
    await Promise.all(promises);
  }
}

