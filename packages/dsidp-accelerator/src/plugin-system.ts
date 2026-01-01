/**
 * DSID-P Plugin System
 * 
 * Extensible plugin architecture:
 * - Plugin lifecycle management
 * - Hook system for extensibility
 * - Plugin marketplace integration
 * - Dependency resolution
 * - Sandboxed execution
 */

// ============== TYPES ==============

export interface PluginConfig {
  pluginsDir: string;
  autoLoad: boolean;
  sandboxed: boolean;
  allowedAPIs: string[];
}

export interface Plugin {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  homepage?: string;
  repository?: string;
  license?: string;
  main: string;
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  hooks?: string[];
  permissions?: PluginPermission[];
  config?: Record<string, PluginConfigField>;
}

export interface PluginInstance {
  plugin: Plugin;
  status: PluginStatus;
  exports: Record<string, unknown>;
  config: Record<string, unknown>;
  error?: string;
  loadedAt?: number;
}

export type PluginStatus = 'installed' | 'loaded' | 'active' | 'disabled' | 'error';

export type PluginPermission = 
  | 'fs:read'
  | 'fs:write'
  | 'net:fetch'
  | 'net:server'
  | 'process:spawn'
  | 'env:read'
  | 'llm:call'
  | 'ui:render';

export interface PluginConfigField {
  type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
  label: string;
  description?: string;
  default?: unknown;
  required?: boolean;
  options?: Array<{ label: string; value: unknown }>;
}

export interface Hook<T = unknown> {
  name: string;
  description: string;
  params: string[];
  returns: string;
  handlers: Array<{ pluginId: string; handler: HookHandler<T> }>;
}

export type HookHandler<T = unknown> = (...args: unknown[]) => T | Promise<T>;

export interface PluginEvent {
  type: PluginEventType;
  pluginId: string;
  timestamp: number;
  data?: unknown;
}

export type PluginEventType = 
  | 'installed'
  | 'loaded'
  | 'activated'
  | 'deactivated'
  | 'uninstalled'
  | 'error'
  | 'config_changed';

export interface PluginMarketplace {
  search(query: string): Promise<Plugin[]>;
  getPlugin(id: string): Promise<Plugin | null>;
  install(id: string): Promise<boolean>;
  getCategories(): Promise<string[]>;
}

// ============== HOOK REGISTRY ==============

export class HookRegistry {
  private hooks: Map<string, Hook> = new Map();

  register<T>(name: string, description: string, params: string[], returns: string): void {
    if (!this.hooks.has(name)) {
      this.hooks.set(name, {
        name,
        description,
        params,
        returns,
        handlers: [],
      });
    }
  }

  addHandler<T>(hookName: string, pluginId: string, handler: HookHandler<T>): boolean {
    const hook = this.hooks.get(hookName);
    if (!hook) return false;
    
    hook.handlers.push({ pluginId, handler: handler as HookHandler });
    return true;
  }

  removeHandler(hookName: string, pluginId: string): boolean {
    const hook = this.hooks.get(hookName);
    if (!hook) return false;
    
    const index = hook.handlers.findIndex(h => h.pluginId === pluginId);
    if (index >= 0) {
      hook.handlers.splice(index, 1);
      return true;
    }
    return false;
  }

  removeAllHandlers(pluginId: string): void {
    for (const hook of this.hooks.values()) {
      hook.handlers = hook.handlers.filter(h => h.pluginId !== pluginId);
    }
  }

  async call<T>(hookName: string, ...args: unknown[]): Promise<T[]> {
    const hook = this.hooks.get(hookName);
    if (!hook) return [];
    
    const results: T[] = [];
    for (const { handler } of hook.handlers) {
      try {
        const result = await handler(...args);
        results.push(result as T);
      } catch (error) {
        console.error(`Hook ${hookName} handler error:`, error);
      }
    }
    return results;
  }

  async callWaterfall<T>(hookName: string, initial: T, ...args: unknown[]): Promise<T> {
    const hook = this.hooks.get(hookName);
    if (!hook) return initial;
    
    let value = initial;
    for (const { handler } of hook.handlers) {
      try {
        value = await handler(value, ...args) as T;
      } catch (error) {
        console.error(`Hook ${hookName} handler error:`, error);
      }
    }
    return value;
  }

  async callFirst<T>(hookName: string, ...args: unknown[]): Promise<T | null> {
    const hook = this.hooks.get(hookName);
    if (!hook || hook.handlers.length === 0) return null;
    
    try {
      return await hook.handlers[0].handler(...args) as T;
    } catch (error) {
      console.error(`Hook ${hookName} handler error:`, error);
      return null;
    }
  }

  getHooks(): Hook[] {
    return Array.from(this.hooks.values());
  }

  hasHook(name: string): boolean {
    return this.hooks.has(name);
  }
}

// ============== PLUGIN MANAGER ==============

export class PluginManager {
  private config: PluginConfig;
  private plugins: Map<string, PluginInstance> = new Map();
  private hooks: HookRegistry;
  private events: PluginEvent[] = [];
  private eventListeners: Array<(event: PluginEvent) => void> = [];

  constructor(config: Partial<PluginConfig> = {}) {
    this.config = {
      pluginsDir: config.pluginsDir || './plugins',
      autoLoad: config.autoLoad ?? true,
      sandboxed: config.sandboxed ?? true,
      allowedAPIs: config.allowedAPIs || ['fetch', 'console'],
    };
    
    this.hooks = new HookRegistry();
    this.registerBuiltinHooks();
  }

  // ============== LIFECYCLE ==============

  async install(plugin: Plugin): Promise<boolean> {
    if (this.plugins.has(plugin.id)) {
      return false;
    }

    // Validate plugin
    if (!this.validatePlugin(plugin)) {
      return false;
    }

    // Check dependencies
    if (plugin.dependencies) {
      for (const [dep, version] of Object.entries(plugin.dependencies)) {
        if (!this.hasPlugin(dep)) {
          console.warn(`Missing dependency: ${dep}@${version}`);
        }
      }
    }

    const instance: PluginInstance = {
      plugin,
      status: 'installed',
      exports: {},
      config: this.getDefaultConfig(plugin),
    };

    this.plugins.set(plugin.id, instance);
    this.emitEvent('installed', plugin.id);

    if (this.config.autoLoad) {
      await this.load(plugin.id);
    }

    return true;
  }

  async load(pluginId: string): Promise<boolean> {
    const instance = this.plugins.get(pluginId);
    if (!instance || instance.status === 'active') {
      return false;
    }

    try {
      // In a real implementation, this would load the plugin module
      // For now, we simulate loading
      instance.status = 'loaded';
      instance.loadedAt = Date.now();
      
      this.emitEvent('loaded', pluginId);
      return true;
    } catch (error) {
      instance.status = 'error';
      instance.error = String(error);
      this.emitEvent('error', pluginId, { error });
      return false;
    }
  }

  async activate(pluginId: string): Promise<boolean> {
    const instance = this.plugins.get(pluginId);
    if (!instance || instance.status !== 'loaded') {
      return false;
    }

    try {
      // Register plugin hooks
      if (instance.plugin.hooks) {
        for (const hookName of instance.plugin.hooks) {
          const handler = instance.exports[hookName] as HookHandler;
          if (handler) {
            this.hooks.addHandler(hookName, pluginId, handler);
          }
        }
      }

      instance.status = 'active';
      this.emitEvent('activated', pluginId);
      return true;
    } catch (error) {
      instance.status = 'error';
      instance.error = String(error);
      this.emitEvent('error', pluginId, { error });
      return false;
    }
  }

  async deactivate(pluginId: string): Promise<boolean> {
    const instance = this.plugins.get(pluginId);
    if (!instance || instance.status !== 'active') {
      return false;
    }

    // Remove plugin hooks
    this.hooks.removeAllHandlers(pluginId);
    
    instance.status = 'disabled';
    this.emitEvent('deactivated', pluginId);
    return true;
  }

  async uninstall(pluginId: string): Promise<boolean> {
    const instance = this.plugins.get(pluginId);
    if (!instance) {
      return false;
    }

    // Deactivate first if active
    if (instance.status === 'active') {
      await this.deactivate(pluginId);
    }

    this.plugins.delete(pluginId);
    this.emitEvent('uninstalled', pluginId);
    return true;
  }

  // ============== CONFIGURATION ==============

  getPluginConfig(pluginId: string): Record<string, unknown> | null {
    const instance = this.plugins.get(pluginId);
    return instance?.config || null;
  }

  setPluginConfig(pluginId: string, config: Record<string, unknown>): boolean {
    const instance = this.plugins.get(pluginId);
    if (!instance) return false;

    instance.config = { ...instance.config, ...config };
    this.emitEvent('config_changed', pluginId, { config });
    return true;
  }

  private getDefaultConfig(plugin: Plugin): Record<string, unknown> {
    const config: Record<string, unknown> = {};
    
    if (plugin.config) {
      for (const [key, field] of Object.entries(plugin.config)) {
        config[key] = field.default;
      }
    }
    
    return config;
  }

  // ============== HOOKS ==============

  registerHook<T>(name: string, description: string, params: string[], returns: string): void {
    this.hooks.register<T>(name, description, params, returns);
  }

  async callHook<T>(name: string, ...args: unknown[]): Promise<T[]> {
    return this.hooks.call<T>(name, ...args);
  }

  async callHookWaterfall<T>(name: string, initial: T, ...args: unknown[]): Promise<T> {
    return this.hooks.callWaterfall<T>(name, initial, ...args);
  }

  getHooks(): Hook[] {
    return this.hooks.getHooks();
  }

  // ============== QUERIES ==============

  getPlugin(id: string): PluginInstance | null {
    return this.plugins.get(id) || null;
  }

  getAllPlugins(): PluginInstance[] {
    return Array.from(this.plugins.values());
  }

  getActivePlugins(): PluginInstance[] {
    return this.getAllPlugins().filter(p => p.status === 'active');
  }

  hasPlugin(id: string): boolean {
    return this.plugins.has(id);
  }

  // ============== EVENTS ==============

  addEventListener(listener: (event: PluginEvent) => void): () => void {
    this.eventListeners.push(listener);
    return () => {
      const index = this.eventListeners.indexOf(listener);
      if (index >= 0) {
        this.eventListeners.splice(index, 1);
      }
    };
  }

  private emitEvent(type: PluginEventType, pluginId: string, data?: unknown): void {
    const event: PluginEvent = {
      type,
      pluginId,
      timestamp: Date.now(),
      data,
    };
    
    this.events.push(event);
    
    for (const listener of this.eventListeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Event listener error:', error);
      }
    }
  }

  getEvents(pluginId?: string): PluginEvent[] {
    if (pluginId) {
      return this.events.filter(e => e.pluginId === pluginId);
    }
    return this.events;
  }

  // ============== VALIDATION ==============

  private validatePlugin(plugin: Plugin): boolean {
    if (!plugin.id || !plugin.name || !plugin.version) {
      return false;
    }

    // Check required permissions
    if (plugin.permissions && this.config.sandboxed) {
      for (const permission of plugin.permissions) {
        if (!this.isPermissionAllowed(permission)) {
          console.warn(`Plugin ${plugin.id} requires disallowed permission: ${permission}`);
        }
      }
    }

    return true;
  }

  private isPermissionAllowed(permission: PluginPermission): boolean {
    const permissionMap: Record<PluginPermission, string[]> = {
      'fs:read': ['fs'],
      'fs:write': ['fs'],
      'net:fetch': ['fetch'],
      'net:server': ['net'],
      'process:spawn': ['process'],
      'env:read': ['env'],
      'llm:call': ['llm'],
      'ui:render': ['ui'],
    };

    const required = permissionMap[permission] || [];
    return required.every(api => this.config.allowedAPIs.includes(api));
  }

  // ============== BUILTIN HOOKS ==============

  private registerBuiltinHooks(): void {
    // Code generation hooks
    this.hooks.register('beforeCodeGenerate', 'Called before code generation', ['prompt', 'options'], 'string');
    this.hooks.register('afterCodeGenerate', 'Called after code generation', ['code', 'options'], 'string');
    
    // Build hooks
    this.hooks.register('beforeBuild', 'Called before build starts', ['config'], 'config');
    this.hooks.register('afterBuild', 'Called after build completes', ['result'], 'result');
    
    // Deploy hooks
    this.hooks.register('beforeDeploy', 'Called before deployment', ['config'], 'config');
    this.hooks.register('afterDeploy', 'Called after deployment', ['result'], 'result');
    
    // File hooks
    this.hooks.register('beforeFileWrite', 'Called before writing a file', ['path', 'content'], 'content');
    this.hooks.register('afterFileRead', 'Called after reading a file', ['path', 'content'], 'content');
    
    // Command hooks
    this.hooks.register('beforeCommand', 'Called before running a command', ['command'], 'command');
    this.hooks.register('afterCommand', 'Called after command execution', ['command', 'result'], 'result');
    
    // Transform hooks
    this.hooks.register('transformCode', 'Transform generated code', ['code', 'language'], 'string');
    this.hooks.register('transformSchema', 'Transform database schema', ['schema'], 'schema');
  }
}

// ============== PLUGIN LOADER ==============

export class PluginLoader {
  private manager: PluginManager;

  constructor(manager: PluginManager) {
    this.manager = manager;
  }

  async loadFromDirectory(dir: string): Promise<Plugin[]> {
    const plugins: Plugin[] = [];
    
    try {
      const fs = await import('fs/promises');
      const path = await import('path');
      
      const entries = await fs.readdir(dir, { withFileTypes: true });
      
      for (const entry of entries) {
        if (entry.isDirectory()) {
          const pluginPath = path.join(dir, entry.name, 'package.json');
          try {
            const packageJson = JSON.parse(await fs.readFile(pluginPath, 'utf-8'));
            
            if (packageJson.dsidp?.plugin) {
              const plugin: Plugin = {
                id: packageJson.name,
                name: packageJson.dsidp.plugin.name || packageJson.name,
                version: packageJson.version,
                description: packageJson.description || '',
                author: packageJson.author || '',
                homepage: packageJson.homepage,
                repository: packageJson.repository?.url,
                license: packageJson.license,
                main: packageJson.main || 'index.js',
                dependencies: packageJson.dependencies,
                peerDependencies: packageJson.peerDependencies,
                hooks: packageJson.dsidp.plugin.hooks,
                permissions: packageJson.dsidp.plugin.permissions,
                config: packageJson.dsidp.plugin.config,
              };
              
              plugins.push(plugin);
              await this.manager.install(plugin);
            }
          } catch {}
        }
      }
    } catch {}
    
    return plugins;
  }

  async loadFromUrl(url: string): Promise<Plugin | null> {
    try {
      const response = await fetch(url);
      const plugin = await response.json() as Plugin;
      
      if (await this.manager.install(plugin)) {
        return plugin;
      }
    } catch {}
    
    return null;
  }
}

// ============== PLUGIN SANDBOX ==============

export class PluginSandbox {
  private allowedGlobals: string[];

  constructor(allowedAPIs: string[] = ['console', 'fetch']) {
    this.allowedGlobals = allowedAPIs;
  }

  createContext(): Record<string, unknown> {
    const context: Record<string, unknown> = {};
    
    // Add allowed globals
    if (this.allowedGlobals.includes('console')) {
      context.console = {
        log: (...args: unknown[]) => console.log('[Plugin]', ...args),
        warn: (...args: unknown[]) => console.warn('[Plugin]', ...args),
        error: (...args: unknown[]) => console.error('[Plugin]', ...args),
      };
    }
    
    if (this.allowedGlobals.includes('fetch')) {
      context.fetch = fetch;
    }
    
    // Add safe utilities
    context.JSON = JSON;
    context.Object = Object;
    context.Array = Array;
    context.String = String;
    context.Number = Number;
    context.Boolean = Boolean;
    context.Date = Date;
    context.Math = Math;
    context.Promise = Promise;
    
    return context;
  }

  async execute(code: string, context: Record<string, unknown> = {}): Promise<unknown> {
    const sandbox = this.createContext();
    const fullContext = { ...sandbox, ...context };
    
    // Create function with limited scope
    const keys = Object.keys(fullContext);
    const values = Object.values(fullContext);
    
    try {
      const fn = new Function(...keys, `"use strict"; return (async () => { ${code} })();`);
      return await fn(...values);
    } catch (error) {
      throw new Error(`Sandbox execution error: ${error}`);
    }
  }
}

// ============== FACTORY ==============

export function createPluginManager(config?: Partial<PluginConfig>): PluginManager {
  return new PluginManager(config);
}

export function createPluginLoader(manager: PluginManager): PluginLoader {
  return new PluginLoader(manager);
}

export function createPluginSandbox(allowedAPIs?: string[]): PluginSandbox {
  return new PluginSandbox(allowedAPIs);
}
