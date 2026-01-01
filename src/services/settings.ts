// ============== SETTINGS SERVICE ==============
// User preferences and IDE configuration management

// ============== TYPES ==============
export interface EditorSettings {
  fontSize: number;
  fontFamily: string;
  tabSize: number;
  insertSpaces: boolean;
  wordWrap: 'off' | 'on' | 'wordWrapColumn' | 'bounded';
  wordWrapColumn: number;
  lineNumbers: 'on' | 'off' | 'relative';
  minimap: boolean;
  minimapWidth: number;
  scrollBeyondLastLine: boolean;
  smoothScrolling: boolean;
  cursorBlinking: 'blink' | 'smooth' | 'phase' | 'expand' | 'solid';
  cursorStyle: 'line' | 'block' | 'underline';
  renderWhitespace: 'none' | 'boundary' | 'selection' | 'all';
  renderLineHighlight: 'none' | 'gutter' | 'line' | 'all';
  bracketPairColorization: boolean;
  autoClosingBrackets: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
  autoClosingQuotes: 'always' | 'languageDefined' | 'beforeWhitespace' | 'never';
  autoIndent: 'none' | 'keep' | 'brackets' | 'advanced' | 'full';
  formatOnSave: boolean;
  formatOnPaste: boolean;
  formatOnType: boolean;
}

export interface TerminalSettings {
  fontSize: number;
  fontFamily: string;
  lineHeight: number;
  cursorBlink: boolean;
  cursorStyle: 'block' | 'underline' | 'bar';
  scrollback: number;
  shell: string;
  shellArgs: string[];
  env: Record<string, string>;
}

export interface WorkbenchSettings {
  sidebarPosition: 'left' | 'right';
  activityBarVisible: boolean;
  statusBarVisible: boolean;
  panelPosition: 'bottom' | 'right';
  startupEditor: 'none' | 'welcomePage' | 'newUntitledFile' | 'welcomePageInEmptyWorkbench';
  colorTheme: string;
  iconTheme: string;
  productIconTheme: string;
  tree: {
    indent: number;
    renderIndentGuides: 'none' | 'onHover' | 'always';
  };
}

export interface FileSettings {
  autoSave: 'off' | 'afterDelay' | 'onFocusChange' | 'onWindowChange';
  autoSaveDelay: number;
  trimTrailingWhitespace: boolean;
  insertFinalNewline: boolean;
  trimFinalNewlines: boolean;
  encoding: string;
  eol: '\n' | '\r\n' | 'auto';
  exclude: Record<string, boolean>;
  watcherExclude: Record<string, boolean>;
}

export interface SearchSettings {
  exclude: Record<string, boolean>;
  useIgnoreFiles: boolean;
  useGlobalIgnoreFiles: boolean;
  followSymlinks: boolean;
  smartCase: boolean;
  showLineNumbers: boolean;
}

export interface GitSettings {
  enabled: boolean;
  autoFetch: boolean;
  autoFetchPeriod: number;
  confirmSync: boolean;
  enableSmartCommit: boolean;
  autofetch: boolean;
  defaultCloneDirectory: string;
}

export interface AISettings {
  enabled: boolean;
  provider: 'openai' | 'anthropic' | 'local';
  model: string;
  temperature: number;
  maxTokens: number;
  autoSuggestions: boolean;
  inlineSuggestions: boolean;
  codeCompletion: boolean;
}

export interface KeybindingSettings {
  preset: 'default' | 'vim' | 'emacs' | 'sublime';
  customBindings: Array<{
    key: string;
    command: string;
    when?: string;
  }>;
}

export interface AllSettings {
  editor: EditorSettings;
  terminal: TerminalSettings;
  workbench: WorkbenchSettings;
  files: FileSettings;
  search: SearchSettings;
  git: GitSettings;
  ai: AISettings;
  keybindings: KeybindingSettings;
  [key: string]: unknown;
}

type SettingsChangeHandler = (settings: AllSettings, changedKeys: string[]) => void;

// ============== DEFAULT SETTINGS ==============
const DEFAULT_SETTINGS: AllSettings = {
  editor: {
    fontSize: 14,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    tabSize: 2,
    insertSpaces: true,
    wordWrap: 'off',
    wordWrapColumn: 80,
    lineNumbers: 'on',
    minimap: true,
    minimapWidth: 100,
    scrollBeyondLastLine: true,
    smoothScrolling: true,
    cursorBlinking: 'blink',
    cursorStyle: 'line',
    renderWhitespace: 'selection',
    renderLineHighlight: 'all',
    bracketPairColorization: true,
    autoClosingBrackets: 'languageDefined',
    autoClosingQuotes: 'languageDefined',
    autoIndent: 'full',
    formatOnSave: true,
    formatOnPaste: false,
    formatOnType: false,
  },
  terminal: {
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
    lineHeight: 1.2,
    cursorBlink: true,
    cursorStyle: 'block',
    scrollback: 10000,
    shell: '',
    shellArgs: [],
    env: {},
  },
  workbench: {
    sidebarPosition: 'left',
    activityBarVisible: true,
    statusBarVisible: true,
    panelPosition: 'bottom',
    startupEditor: 'welcomePage',
    colorTheme: 'Default Dark+',
    iconTheme: 'vs-seti',
    productIconTheme: 'Default',
    tree: {
      indent: 8,
      renderIndentGuides: 'onHover',
    },
  },
  files: {
    autoSave: 'afterDelay',
    autoSaveDelay: 1000,
    trimTrailingWhitespace: true,
    insertFinalNewline: true,
    trimFinalNewlines: true,
    encoding: 'utf8',
    eol: 'auto',
    exclude: {
      '**/.git': true,
      '**/.DS_Store': true,
      '**/node_modules': true,
      '**/__pycache__': true,
    },
    watcherExclude: {
      '**/.git/objects/**': true,
      '**/node_modules/**': true,
    },
  },
  search: {
    exclude: {
      '**/node_modules': true,
      '**/bower_components': true,
      '**/*.code-search': true,
    },
    useIgnoreFiles: true,
    useGlobalIgnoreFiles: true,
    followSymlinks: true,
    smartCase: true,
    showLineNumbers: false,
  },
  git: {
    enabled: true,
    autoFetch: true,
    autoFetchPeriod: 180,
    confirmSync: false,
    enableSmartCommit: true,
    autofetch: true,
    defaultCloneDirectory: '',
  },
  ai: {
    enabled: true,
    provider: 'openai',
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 4096,
    autoSuggestions: true,
    inlineSuggestions: true,
    codeCompletion: true,
  },
  keybindings: {
    preset: 'default',
    customBindings: [],
  },
};

// ============== SETTINGS SERVICE ==============
class SettingsService {
  private settings: AllSettings;
  private changeHandlers = new Set<SettingsChangeHandler>();
  private storageKey = 'ide-settings';
  private syncEnabled = true;

  constructor() {
    this.settings = this.loadSettings();
  }

  // Get all settings
  getAll(): AllSettings {
    return { ...this.settings };
  }

  // Get setting by path (e.g., 'editor.fontSize')
  get<T>(path: string): T {
    const keys = path.split('.');
    let value: unknown = this.settings;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return this.getDefault<T>(path);
      }
    }

    return value as T;
  }

  // Set setting by path
  set<T>(path: string, value: T): void {
    const keys = path.split('.');
    const lastKey = keys.pop()!;
    let obj: Record<string, unknown> = this.settings;

    for (const key of keys) {
      if (!(key in obj) || typeof obj[key] !== 'object') {
        obj[key] = {};
      }
      obj = obj[key] as Record<string, unknown>;
    }

    obj[lastKey] = value;
    this.saveSettings();
    this.notifyChange([path]);
  }

  // Update multiple settings
  update(updates: Record<string, unknown>): void {
    const changedKeys: string[] = [];

    for (const [path, value] of Object.entries(updates)) {
      const keys = path.split('.');
      const lastKey = keys.pop()!;
      let obj: Record<string, unknown> = this.settings;

      for (const key of keys) {
        if (!(key in obj) || typeof obj[key] !== 'object') {
          obj[key] = {};
        }
        obj = obj[key] as Record<string, unknown>;
      }

      if (obj[lastKey] !== value) {
        obj[lastKey] = value;
        changedKeys.push(path);
      }
    }

    if (changedKeys.length > 0) {
      this.saveSettings();
      this.notifyChange(changedKeys);
    }
  }

  // Reset to defaults
  reset(path?: string): void {
    if (path) {
      const defaultValue = this.getDefault(path);
      this.set(path, defaultValue);
    } else {
      this.settings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
      this.saveSettings();
      this.notifyChange(['*']);
    }
  }

  // Get default value
  getDefault<T>(path: string): T {
    const keys = path.split('.');
    let value: unknown = DEFAULT_SETTINGS;

    for (const key of keys) {
      if (value && typeof value === 'object' && key in value) {
        value = (value as Record<string, unknown>)[key];
      } else {
        return undefined as T;
      }
    }

    return value as T;
  }

  // Check if setting differs from default
  isModified(path: string): boolean {
    const current = this.get(path);
    const defaultVal = this.getDefault(path);
    return JSON.stringify(current) !== JSON.stringify(defaultVal);
  }

  // Get all modified settings
  getModified(): Record<string, unknown> {
    const modified: Record<string, unknown> = {};
    this.collectModified(this.settings, DEFAULT_SETTINGS, '', modified);
    return modified;
  }

  // Subscribe to changes
  onChange(handler: SettingsChangeHandler): () => void {
    this.changeHandlers.add(handler);
    return () => this.changeHandlers.delete(handler);
  }

  // Export settings
  export(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  // Import settings
  import(json: string): void {
    try {
      const imported = JSON.parse(json);
      this.settings = this.mergeWithDefaults(imported);
      this.saveSettings();
      this.notifyChange(['*']);
    } catch (error) {
      throw new Error('Invalid settings JSON');
    }
  }

  // Sync with server
  async sync(): Promise<void> {
    if (!this.syncEnabled) return;

    try {
      const ideUrl = import.meta.env.VITE_IDE_URL || 'http://localhost:8080';
      const response = await fetch(`${ideUrl}/api/settings/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.settings),
      });

      if (response.ok) {
        const serverSettings = await response.json();
        if (serverSettings.updatedAt > (this.settings as AllSettings & { updatedAt?: number }).updatedAt) {
          this.settings = this.mergeWithDefaults(serverSettings);
          this.saveSettings();
          this.notifyChange(['*']);
        }
      }
    } catch {
      // Sync failed, continue with local settings
    }
  }

  private loadSettings(): AllSettings {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return this.mergeWithDefaults(JSON.parse(stored));
      }
    } catch {
      // Invalid stored settings
    }
    return JSON.parse(JSON.stringify(DEFAULT_SETTINGS));
  }

  private saveSettings(): void {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.settings));
    } catch {
      // Storage full or unavailable
    }
  }

  private mergeWithDefaults(partial: Partial<AllSettings>): AllSettings {
    return this.deepMerge(JSON.parse(JSON.stringify(DEFAULT_SETTINGS)), partial);
  }

  private deepMerge(target: Record<string, unknown>, source: Record<string, unknown>): AllSettings {
    for (const key of Object.keys(source)) {
      if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
        if (!target[key]) target[key] = {};
        this.deepMerge(target[key] as Record<string, unknown>, source[key] as Record<string, unknown>);
      } else {
        target[key] = source[key];
      }
    }
    return target as AllSettings;
  }

  private collectModified(
    current: Record<string, unknown>,
    defaults: Record<string, unknown>,
    prefix: string,
    result: Record<string, unknown>
  ): void {
    for (const key of Object.keys(current)) {
      const path = prefix ? `${prefix}.${key}` : key;
      const currentVal = current[key];
      const defaultVal = defaults[key];

      if (currentVal && typeof currentVal === 'object' && !Array.isArray(currentVal)) {
        this.collectModified(
          currentVal as Record<string, unknown>,
          (defaultVal || {}) as Record<string, unknown>,
          path,
          result
        );
      } else if (JSON.stringify(currentVal) !== JSON.stringify(defaultVal)) {
        result[path] = currentVal;
      }
    }
  }

  private notifyChange(changedKeys: string[]): void {
    this.changeHandlers.forEach(handler => handler(this.settings, changedKeys));
  }
}

// ============== SINGLETON ==============
export const settingsService = new SettingsService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback } from 'react';

export function useSettings() {
  const [settings, setSettings] = useState<AllSettings>(settingsService.getAll());

  useEffect(() => {
    const unsubscribe = settingsService.onChange((newSettings) => {
      setSettings({ ...newSettings });
    });
    return unsubscribe;
  }, []);

  const updateSetting = useCallback(<T,>(path: string, value: T) => {
    settingsService.set(path, value);
  }, []);

  const updateSettings = useCallback((updates: Record<string, unknown>) => {
    settingsService.update(updates);
  }, []);

  const resetSetting = useCallback((path?: string) => {
    settingsService.reset(path);
  }, []);

  return { settings, updateSetting, updateSettings, resetSetting };
}

export function useSetting<T>(path: string): [T, (value: T) => void] {
  const [value, setValue] = useState<T>(settingsService.get<T>(path));

  useEffect(() => {
    const unsubscribe = settingsService.onChange((_, changedKeys) => {
      if (changedKeys.includes('*') || changedKeys.some(k => path.startsWith(k) || k.startsWith(path))) {
        setValue(settingsService.get<T>(path));
      }
    });
    return unsubscribe;
  }, [path]);

  const updateValue = useCallback((newValue: T) => {
    settingsService.set(path, newValue);
  }, [path]);

  return [value, updateValue];
}

export function useEditorSettings(): EditorSettings {
  const [settings] = useSetting<EditorSettings>('editor');
  return settings;
}

export function useTerminalSettings(): TerminalSettings {
  const [settings] = useSetting<TerminalSettings>('terminal');
  return settings;
}

export function useWorkbenchSettings(): WorkbenchSettings {
  const [settings] = useSetting<WorkbenchSettings>('workbench');
  return settings;
}

export function useAISettings(): AISettings {
  const [settings] = useSetting<AISettings>('ai');
  return settings;
}

export default settingsService;
