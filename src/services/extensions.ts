// ============== EXTENSIONS SERVICE ==============
// Plugin and extension management for IDE extensibility

// ============== TYPES ==============
export interface Extension {
  id: string;
  name: string;
  displayName: string;
  version: string;
  description: string;
  author: string;
  publisher: string;
  icon?: string;
  categories: string[];
  keywords: string[];
  repository?: string;
  homepage?: string;
  license?: string;
  engines: { vscode?: string; ide?: string };
  activationEvents: string[];
  contributes: ExtensionContributions;
  status: 'installed' | 'enabled' | 'disabled' | 'updating';
  installedAt?: number;
  updatedAt?: number;
}

export interface ExtensionContributions {
  commands?: Command[];
  keybindings?: Keybinding[];
  menus?: MenuContribution[];
  languages?: LanguageContribution[];
  themes?: ThemeContribution[];
  snippets?: SnippetContribution[];
  configuration?: ConfigurationContribution;
  views?: ViewContribution[];
}

export interface Command {
  command: string;
  title: string;
  category?: string;
  icon?: string;
}

export interface Keybinding {
  command: string;
  key: string;
  mac?: string;
  when?: string;
}

export interface MenuContribution {
  id: string;
  items: MenuItem[];
}

export interface MenuItem {
  command: string;
  when?: string;
  group?: string;
}

export interface LanguageContribution {
  id: string;
  extensions: string[];
  aliases?: string[];
  configuration?: string;
}

export interface ThemeContribution {
  id: string;
  label: string;
  uiTheme: 'vs' | 'vs-dark' | 'hc-black';
  path: string;
}

export interface SnippetContribution {
  language: string;
  path: string;
}

export interface ConfigurationContribution {
  title: string;
  properties: Record<string, ConfigurationProperty>;
}

export interface ConfigurationProperty {
  type: string;
  default?: unknown;
  description?: string;
  enum?: string[];
  enumDescriptions?: string[];
}

export interface ViewContribution {
  id: string;
  name: string;
  when?: string;
}

export interface ExtensionSearchResult {
  extensions: ExtensionListing[];
  total: number;
  page: number;
  pageSize: number;
}

export interface ExtensionListing {
  id: string;
  name: string;
  displayName: string;
  version: string;
  description: string;
  author: string;
  publisher: string;
  icon?: string;
  downloads: number;
  rating: number;
  categories: string[];
}

type ExtensionEventHandler = (event: ExtensionEvent) => void;

export interface ExtensionEvent {
  type: 'installed' | 'uninstalled' | 'enabled' | 'disabled' | 'updated' | 'activated';
  extension: Extension;
}

// ============== EXTENSIONS SERVICE ==============
class ExtensionsService {
  private extensions = new Map<string, Extension>();
  private activeExtensions = new Set<string>();
  private eventHandlers = new Set<ExtensionEventHandler>();
  private commandHandlers = new Map<string, () => void | Promise<void>>();
  private configurationCache = new Map<string, unknown>();

  constructor() {
    this.loadInstalledExtensions();
  }

  // Search marketplace
  async search(query: string, options?: {
    category?: string;
    sortBy?: 'relevance' | 'downloads' | 'rating' | 'updated';
    page?: number;
    pageSize?: number;
  }): Promise<ExtensionSearchResult> {
    try {
      const params = new URLSearchParams({
        q: query,
        ...(options?.category && { category: options.category }),
        ...(options?.sortBy && { sortBy: options.sortBy }),
        ...(options?.page && { page: options.page.toString() }),
        ...(options?.pageSize && { pageSize: options.pageSize.toString() }),
      });

      const response = await fetch(`http://localhost:8080/api/extensions/search?${params}`);
      if (!response.ok) throw new Error('Search failed');
      return response.json();
    } catch (error) {
      console.error('Extension search failed:', error);
      return { extensions: [], total: 0, page: 1, pageSize: 20 };
    }
  }

  // Get extension details
  async getDetails(extensionId: string): Promise<Extension | null> {
    // Check local first
    const local = this.extensions.get(extensionId);
    if (local) return local;

    try {
      const response = await fetch(`http://localhost:8080/api/extensions/${extensionId}`);
      if (!response.ok) return null;
      return response.json();
    } catch {
      return null;
    }
  }

  // Install extension
  async install(extensionId: string): Promise<Extension> {
    try {
      const response = await fetch('http://localhost:8080/api/extensions/install', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensionId }),
      });

      if (!response.ok) throw new Error('Installation failed');

      const extension: Extension = await response.json();
      extension.status = 'enabled';
      extension.installedAt = Date.now();

      this.extensions.set(extensionId, extension);
      this.emitEvent({ type: 'installed', extension });

      // Auto-activate
      await this.activate(extensionId);

      return extension;
    } catch (error) {
      throw error;
    }
  }

  // Uninstall extension
  async uninstall(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId);
    if (!extension) return;

    // Deactivate first
    await this.deactivate(extensionId);

    try {
      await fetch('http://localhost:8080/api/extensions/uninstall', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensionId }),
      });

      this.extensions.delete(extensionId);
      this.emitEvent({ type: 'uninstalled', extension });
    } catch (error) {
      throw error;
    }
  }

  // Enable extension
  async enable(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId);
    if (!extension) return;

    extension.status = 'enabled';
    await this.activate(extensionId);
    this.emitEvent({ type: 'enabled', extension });
  }

  // Disable extension
  async disable(extensionId: string): Promise<void> {
    const extension = this.extensions.get(extensionId);
    if (!extension) return;

    await this.deactivate(extensionId);
    extension.status = 'disabled';
    this.emitEvent({ type: 'disabled', extension });
  }

  // Update extension
  async update(extensionId: string): Promise<Extension> {
    const extension = this.extensions.get(extensionId);
    if (!extension) throw new Error('Extension not found');

    extension.status = 'updating';

    try {
      const response = await fetch('http://localhost:8080/api/extensions/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ extensionId }),
      });

      if (!response.ok) throw new Error('Update failed');

      const updated: Extension = await response.json();
      updated.status = 'enabled';
      updated.updatedAt = Date.now();

      this.extensions.set(extensionId, updated);
      this.emitEvent({ type: 'updated', extension: updated });

      return updated;
    } catch (error) {
      extension.status = 'enabled';
      throw error;
    }
  }

  // Check for updates
  async checkUpdates(): Promise<Array<{ extension: Extension; newVersion: string }>> {
    const updates: Array<{ extension: Extension; newVersion: string }> = [];

    for (const extension of this.extensions.values()) {
      try {
        const response = await fetch(
          `http://localhost:8080/api/extensions/${extension.id}/latest-version`
        );
        if (response.ok) {
          const { version } = await response.json();
          if (version !== extension.version) {
            updates.push({ extension, newVersion: version });
          }
        }
      } catch {
        // Skip failed checks
      }
    }

    return updates;
  }

  // Get installed extensions
  getInstalled(): Extension[] {
    return Array.from(this.extensions.values());
  }

  // Get enabled extensions
  getEnabled(): Extension[] {
    return Array.from(this.extensions.values()).filter(e => e.status === 'enabled');
  }

  // Get extension by ID
  getExtension(extensionId: string): Extension | undefined {
    return this.extensions.get(extensionId);
  }

  // Check if extension is active
  isActive(extensionId: string): boolean {
    return this.activeExtensions.has(extensionId);
  }

  // Register command handler
  registerCommand(command: string, handler: () => void | Promise<void>): () => void {
    this.commandHandlers.set(command, handler);
    return () => this.commandHandlers.delete(command);
  }

  // Execute command
  async executeCommand(command: string): Promise<void> {
    const handler = this.commandHandlers.get(command);
    if (handler) {
      await handler();
    }
  }

  // Get all commands
  getCommands(): Command[] {
    const commands: Command[] = [];
    for (const ext of this.getEnabled()) {
      if (ext.contributes.commands) {
        commands.push(...ext.contributes.commands);
      }
    }
    return commands;
  }

  // Get keybindings
  getKeybindings(): Keybinding[] {
    const keybindings: Keybinding[] = [];
    for (const ext of this.getEnabled()) {
      if (ext.contributes.keybindings) {
        keybindings.push(...ext.contributes.keybindings);
      }
    }
    return keybindings;
  }

  // Get themes
  getThemes(): ThemeContribution[] {
    const themes: ThemeContribution[] = [];
    for (const ext of this.getEnabled()) {
      if (ext.contributes.themes) {
        themes.push(...ext.contributes.themes);
      }
    }
    return themes;
  }

  // Get language contributions
  getLanguages(): LanguageContribution[] {
    const languages: LanguageContribution[] = [];
    for (const ext of this.getEnabled()) {
      if (ext.contributes.languages) {
        languages.push(...ext.contributes.languages);
      }
    }
    return languages;
  }

  // Get configuration
  getConfiguration<T>(section: string): T | undefined {
    return this.configurationCache.get(section) as T | undefined;
  }

  // Set configuration
  setConfiguration(section: string, value: unknown): void {
    this.configurationCache.set(section, value);
  }

  // Subscribe to events
  onEvent(handler: ExtensionEventHandler): () => void {
    this.eventHandlers.add(handler);
    return () => this.eventHandlers.delete(handler);
  }

  private async activate(extensionId: string): Promise<void> {
    if (this.activeExtensions.has(extensionId)) return;

    const extension = this.extensions.get(extensionId);
    if (!extension || extension.status !== 'enabled') return;

    this.activeExtensions.add(extensionId);

    // Register commands
    if (extension.contributes.commands) {
      for (const cmd of extension.contributes.commands) {
        // Commands would be registered here with actual handlers
      }
    }

    this.emitEvent({ type: 'activated', extension });
  }

  private async deactivate(extensionId: string): Promise<void> {
    if (!this.activeExtensions.has(extensionId)) return;

    this.activeExtensions.delete(extensionId);

    const extension = this.extensions.get(extensionId);
    if (extension?.contributes.commands) {
      for (const cmd of extension.contributes.commands) {
        this.commandHandlers.delete(cmd.command);
      }
    }
  }

  private async loadInstalledExtensions(): Promise<void> {
    try {
      const response = await fetch('http://localhost:8080/api/extensions/installed');
      if (response.ok) {
        const extensions: Extension[] = await response.json();
        for (const ext of extensions) {
          this.extensions.set(ext.id, ext);
          if (ext.status === 'enabled') {
            this.activate(ext.id);
          }
        }
      }
    } catch {
      // Load from local storage fallback
      const stored = localStorage.getItem('installed-extensions');
      if (stored) {
        const extensions: Extension[] = JSON.parse(stored);
        for (const ext of extensions) {
          this.extensions.set(ext.id, ext);
        }
      }
    }
  }

  private emitEvent(event: ExtensionEvent): void {
    this.eventHandlers.forEach(handler => handler(event));
    
    // Persist to local storage
    const extensions = Array.from(this.extensions.values());
    localStorage.setItem('installed-extensions', JSON.stringify(extensions));
  }
}

// ============== SINGLETON ==============
export const extensionsService = new ExtensionsService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback } from 'react';

export function useExtensions() {
  const [extensions, setExtensions] = useState<Extension[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setExtensions(extensionsService.getInstalled());

    const unsubscribe = extensionsService.onEvent(() => {
      setExtensions(extensionsService.getInstalled());
    });

    return unsubscribe;
  }, []);

  const install = useCallback(async (extensionId: string) => {
    setIsLoading(true);
    try {
      await extensionsService.install(extensionId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const uninstall = useCallback(async (extensionId: string) => {
    setIsLoading(true);
    try {
      await extensionsService.uninstall(extensionId);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const enable = useCallback((extensionId: string) => extensionsService.enable(extensionId), []);
  const disable = useCallback((extensionId: string) => extensionsService.disable(extensionId), []);
  const update = useCallback((extensionId: string) => extensionsService.update(extensionId), []);

  return { extensions, isLoading, install, uninstall, enable, disable, update };
}

export function useExtensionSearch(initialQuery = '') {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<ExtensionListing[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [total, setTotal] = useState(0);

  const search = useCallback(async (searchQuery: string, options?: {
    category?: string;
    sortBy?: 'relevance' | 'downloads' | 'rating' | 'updated';
  }) => {
    setQuery(searchQuery);
    setIsSearching(true);
    try {
      const result = await extensionsService.search(searchQuery, options);
      setResults(result.extensions);
      setTotal(result.total);
    } finally {
      setIsSearching(false);
    }
  }, []);

  return { query, results, isSearching, total, search };
}

export function useCommands() {
  const [commands, setCommands] = useState<Command[]>([]);

  useEffect(() => {
    setCommands(extensionsService.getCommands());

    const unsubscribe = extensionsService.onEvent(() => {
      setCommands(extensionsService.getCommands());
    });

    return unsubscribe;
  }, []);

  const execute = useCallback((command: string) => {
    return extensionsService.executeCommand(command);
  }, []);

  return { commands, execute };
}

export default extensionsService;
