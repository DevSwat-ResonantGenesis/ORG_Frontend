// ============== KEYBOARD SHORTCUTS SERVICE ==============
// Global keyboard shortcut management for the IDE

// ============== TYPES ==============
export interface KeyBinding {
  id: string;
  key: string;
  command: string;
  when?: string;
  mac?: string;
  description?: string;
  category?: string;
}

export interface KeyCombo {
  key: string;
  ctrl: boolean;
  shift: boolean;
  alt: boolean;
  meta: boolean;
}

type CommandHandler = (event: KeyboardEvent) => void | boolean;
type KeyPressHandler = (combo: KeyCombo, event: KeyboardEvent) => void;

// ============== DEFAULT KEYBINDINGS ==============
const DEFAULT_KEYBINDINGS: KeyBinding[] = [
  // File operations
  { id: 'file.new', key: 'ctrl+n', mac: 'cmd+n', command: 'file.new', description: 'New File', category: 'File' },
  { id: 'file.open', key: 'ctrl+o', mac: 'cmd+o', command: 'file.open', description: 'Open File', category: 'File' },
  { id: 'file.save', key: 'ctrl+s', mac: 'cmd+s', command: 'file.save', description: 'Save File', category: 'File' },
  { id: 'file.saveAll', key: 'ctrl+shift+s', mac: 'cmd+shift+s', command: 'file.saveAll', description: 'Save All', category: 'File' },
  { id: 'file.close', key: 'ctrl+w', mac: 'cmd+w', command: 'file.close', description: 'Close File', category: 'File' },
  
  // Edit operations
  { id: 'edit.undo', key: 'ctrl+z', mac: 'cmd+z', command: 'edit.undo', description: 'Undo', category: 'Edit' },
  { id: 'edit.redo', key: 'ctrl+shift+z', mac: 'cmd+shift+z', command: 'edit.redo', description: 'Redo', category: 'Edit' },
  { id: 'edit.cut', key: 'ctrl+x', mac: 'cmd+x', command: 'edit.cut', description: 'Cut', category: 'Edit' },
  { id: 'edit.copy', key: 'ctrl+c', mac: 'cmd+c', command: 'edit.copy', description: 'Copy', category: 'Edit' },
  { id: 'edit.paste', key: 'ctrl+v', mac: 'cmd+v', command: 'edit.paste', description: 'Paste', category: 'Edit' },
  { id: 'edit.selectAll', key: 'ctrl+a', mac: 'cmd+a', command: 'edit.selectAll', description: 'Select All', category: 'Edit' },
  { id: 'edit.find', key: 'ctrl+f', mac: 'cmd+f', command: 'edit.find', description: 'Find', category: 'Edit' },
  { id: 'edit.replace', key: 'ctrl+h', mac: 'cmd+h', command: 'edit.replace', description: 'Replace', category: 'Edit' },
  { id: 'edit.findInFiles', key: 'ctrl+shift+f', mac: 'cmd+shift+f', command: 'edit.findInFiles', description: 'Find in Files', category: 'Edit' },
  
  // View operations
  { id: 'view.commandPalette', key: 'ctrl+shift+p', mac: 'cmd+shift+p', command: 'view.commandPalette', description: 'Command Palette', category: 'View' },
  { id: 'view.quickOpen', key: 'ctrl+p', mac: 'cmd+p', command: 'view.quickOpen', description: 'Quick Open', category: 'View' },
  { id: 'view.explorer', key: 'ctrl+shift+e', mac: 'cmd+shift+e', command: 'view.explorer', description: 'Explorer', category: 'View' },
  { id: 'view.search', key: 'ctrl+shift+s', mac: 'cmd+shift+s', command: 'view.search', description: 'Search', category: 'View' },
  { id: 'view.git', key: 'ctrl+shift+g', mac: 'cmd+shift+g', command: 'view.git', description: 'Source Control', category: 'View' },
  { id: 'view.debug', key: 'ctrl+shift+d', mac: 'cmd+shift+d', command: 'view.debug', description: 'Debug', category: 'View' },
  { id: 'view.extensions', key: 'ctrl+shift+x', mac: 'cmd+shift+x', command: 'view.extensions', description: 'Extensions', category: 'View' },
  { id: 'view.terminal', key: 'ctrl+`', mac: 'cmd+`', command: 'view.terminal', description: 'Toggle Terminal', category: 'View' },
  { id: 'view.sidebar', key: 'ctrl+b', mac: 'cmd+b', command: 'view.sidebar', description: 'Toggle Sidebar', category: 'View' },
  { id: 'view.zen', key: 'ctrl+k z', mac: 'cmd+k z', command: 'view.zen', description: 'Zen Mode', category: 'View' },
  
  // Editor operations
  { id: 'editor.format', key: 'shift+alt+f', mac: 'shift+option+f', command: 'editor.format', description: 'Format Document', category: 'Editor' },
  { id: 'editor.comment', key: 'ctrl+/', mac: 'cmd+/', command: 'editor.comment', description: 'Toggle Comment', category: 'Editor' },
  { id: 'editor.blockComment', key: 'shift+alt+a', mac: 'shift+option+a', command: 'editor.blockComment', description: 'Toggle Block Comment', category: 'Editor' },
  { id: 'editor.indent', key: 'ctrl+]', mac: 'cmd+]', command: 'editor.indent', description: 'Indent Line', category: 'Editor' },
  { id: 'editor.outdent', key: 'ctrl+[', mac: 'cmd+[', command: 'editor.outdent', description: 'Outdent Line', category: 'Editor' },
  { id: 'editor.moveLine.up', key: 'alt+up', mac: 'option+up', command: 'editor.moveLine.up', description: 'Move Line Up', category: 'Editor' },
  { id: 'editor.moveLine.down', key: 'alt+down', mac: 'option+down', command: 'editor.moveLine.down', description: 'Move Line Down', category: 'Editor' },
  { id: 'editor.copyLine.up', key: 'shift+alt+up', mac: 'shift+option+up', command: 'editor.copyLine.up', description: 'Copy Line Up', category: 'Editor' },
  { id: 'editor.copyLine.down', key: 'shift+alt+down', mac: 'shift+option+down', command: 'editor.copyLine.down', description: 'Copy Line Down', category: 'Editor' },
  { id: 'editor.deleteLine', key: 'ctrl+shift+k', mac: 'cmd+shift+k', command: 'editor.deleteLine', description: 'Delete Line', category: 'Editor' },
  { id: 'editor.goToLine', key: 'ctrl+g', mac: 'cmd+g', command: 'editor.goToLine', description: 'Go to Line', category: 'Editor' },
  { id: 'editor.goToDefinition', key: 'f12', command: 'editor.goToDefinition', description: 'Go to Definition', category: 'Editor' },
  { id: 'editor.peekDefinition', key: 'alt+f12', mac: 'option+f12', command: 'editor.peekDefinition', description: 'Peek Definition', category: 'Editor' },
  { id: 'editor.rename', key: 'f2', command: 'editor.rename', description: 'Rename Symbol', category: 'Editor' },
  { id: 'editor.quickFix', key: 'ctrl+.', mac: 'cmd+.', command: 'editor.quickFix', description: 'Quick Fix', category: 'Editor' },
  
  // Debug operations
  { id: 'debug.start', key: 'f5', command: 'debug.start', description: 'Start Debugging', category: 'Debug' },
  { id: 'debug.stop', key: 'shift+f5', command: 'debug.stop', description: 'Stop Debugging', category: 'Debug' },
  { id: 'debug.restart', key: 'ctrl+shift+f5', mac: 'cmd+shift+f5', command: 'debug.restart', description: 'Restart Debugging', category: 'Debug' },
  { id: 'debug.continue', key: 'f5', command: 'debug.continue', description: 'Continue', category: 'Debug', when: 'debugging' },
  { id: 'debug.stepOver', key: 'f10', command: 'debug.stepOver', description: 'Step Over', category: 'Debug' },
  { id: 'debug.stepInto', key: 'f11', command: 'debug.stepInto', description: 'Step Into', category: 'Debug' },
  { id: 'debug.stepOut', key: 'shift+f11', command: 'debug.stepOut', description: 'Step Out', category: 'Debug' },
  { id: 'debug.toggleBreakpoint', key: 'f9', command: 'debug.toggleBreakpoint', description: 'Toggle Breakpoint', category: 'Debug' },
  
  // AI operations
  { id: 'ai.chat', key: 'ctrl+l', mac: 'cmd+l', command: 'ai.chat', description: 'Open AI Chat', category: 'AI' },
  { id: 'ai.inline', key: 'ctrl+i', mac: 'cmd+i', command: 'ai.inline', description: 'Inline AI', category: 'AI' },
  { id: 'ai.explain', key: 'ctrl+shift+e', mac: 'cmd+shift+e', command: 'ai.explain', description: 'Explain Code', category: 'AI' },
  { id: 'ai.refactor', key: 'ctrl+shift+r', mac: 'cmd+shift+r', command: 'ai.refactor', description: 'AI Refactor', category: 'AI' },
];

// ============== KEYBOARD SERVICE ==============
class KeyboardService {
  private bindings = new Map<string, KeyBinding>();
  private handlers = new Map<string, CommandHandler>();
  private globalHandlers = new Set<KeyPressHandler>();
  private contexts = new Set<string>();
  private isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
  private sequenceBuffer: string[] = [];
  private sequenceTimeout: NodeJS.Timeout | null = null;

  constructor() {
    this.loadDefaultBindings();
    this.loadCustomBindings();
    this.setupGlobalListener();
  }

  // Register command handler
  registerCommand(command: string, handler: CommandHandler): () => void {
    this.handlers.set(command, handler);
    return () => this.handlers.delete(command);
  }

  // Register multiple commands
  registerCommands(commands: Record<string, CommandHandler>): () => void {
    const unsubscribes: Array<() => void> = [];
    for (const [command, handler] of Object.entries(commands)) {
      unsubscribes.push(this.registerCommand(command, handler));
    }
    return () => unsubscribes.forEach(fn => fn());
  }

  // Add keybinding
  addBinding(binding: KeyBinding): void {
    this.bindings.set(binding.id, binding);
    this.saveCustomBindings();
  }

  // Remove keybinding
  removeBinding(id: string): void {
    this.bindings.delete(id);
    this.saveCustomBindings();
  }

  // Update keybinding
  updateBinding(id: string, key: string): void {
    const binding = this.bindings.get(id);
    if (binding) {
      binding.key = key;
      this.saveCustomBindings();
    }
  }

  // Reset keybinding to default
  resetBinding(id: string): void {
    const defaultBinding = DEFAULT_KEYBINDINGS.find(b => b.id === id);
    if (defaultBinding) {
      this.bindings.set(id, { ...defaultBinding });
      this.saveCustomBindings();
    }
  }

  // Reset all keybindings
  resetAll(): void {
    this.bindings.clear();
    this.loadDefaultBindings();
    localStorage.removeItem('custom-keybindings');
  }

  // Get all bindings
  getBindings(): KeyBinding[] {
    return Array.from(this.bindings.values());
  }

  // Get binding by command
  getBindingForCommand(command: string): KeyBinding | undefined {
    return Array.from(this.bindings.values()).find(b => b.command === command);
  }

  // Get bindings by category
  getBindingsByCategory(): Record<string, KeyBinding[]> {
    const categories: Record<string, KeyBinding[]> = {};
    for (const binding of this.bindings.values()) {
      const category = binding.category || 'Other';
      if (!categories[category]) categories[category] = [];
      categories[category].push(binding);
    }
    return categories;
  }

  // Set context
  setContext(context: string, value: boolean): void {
    if (value) {
      this.contexts.add(context);
    } else {
      this.contexts.delete(context);
    }
  }

  // Check context
  hasContext(context: string): boolean {
    return this.contexts.has(context);
  }

  // Execute command by name
  executeCommand(command: string): boolean {
    const handler = this.handlers.get(command);
    if (handler) {
      handler(new KeyboardEvent('keydown'));
      return true;
    }
    return false;
  }

  // Subscribe to all key presses
  onKeyPress(handler: KeyPressHandler): () => void {
    this.globalHandlers.add(handler);
    return () => this.globalHandlers.delete(handler);
  }

  // Parse key string to combo
  parseKeyCombo(keyString: string): KeyCombo {
    const parts = keyString.toLowerCase().split('+');
    return {
      key: parts[parts.length - 1],
      ctrl: parts.includes('ctrl'),
      shift: parts.includes('shift'),
      alt: parts.includes('alt') || parts.includes('option'),
      meta: parts.includes('meta') || parts.includes('cmd'),
    };
  }

  // Format key combo for display
  formatKeyCombo(keyString: string): string {
    const combo = this.parseKeyCombo(keyString);
    const parts: string[] = [];

    if (this.isMac) {
      if (combo.ctrl) parts.push('⌃');
      if (combo.alt) parts.push('⌥');
      if (combo.shift) parts.push('⇧');
      if (combo.meta) parts.push('⌘');
    } else {
      if (combo.ctrl) parts.push('Ctrl');
      if (combo.alt) parts.push('Alt');
      if (combo.shift) parts.push('Shift');
      if (combo.meta) parts.push('Win');
    }

    const keyDisplay = this.formatKey(combo.key);
    parts.push(keyDisplay);

    return this.isMac ? parts.join('') : parts.join('+');
  }

  private formatKey(key: string): string {
    const keyMap: Record<string, string> = {
      'arrowup': '↑',
      'arrowdown': '↓',
      'arrowleft': '←',
      'arrowright': '→',
      'enter': '↵',
      'escape': 'Esc',
      'backspace': '⌫',
      'delete': 'Del',
      'tab': 'Tab',
      'space': 'Space',
      '`': '`',
    };
    return keyMap[key] || key.toUpperCase();
  }

  private setupGlobalListener(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('keydown', (event) => {
      // Build key combo
      const combo: KeyCombo = {
        key: event.key.toLowerCase(),
        ctrl: event.ctrlKey,
        shift: event.shiftKey,
        alt: event.altKey,
        meta: event.metaKey,
      };

      // Notify global handlers
      this.globalHandlers.forEach(handler => handler(combo, event));

      // Build key string
      const keyString = this.buildKeyString(combo);

      // Handle key sequences (e.g., ctrl+k z)
      if (this.sequenceBuffer.length > 0) {
        const sequence = [...this.sequenceBuffer, keyString].join(' ');
        const binding = this.findBindingByKey(sequence);
        
        if (binding && this.checkContext(binding)) {
          event.preventDefault();
          this.executeBinding(binding, event);
          this.clearSequence();
          return;
        }

        this.clearSequence();
      }

      // Check for sequence starter
      const startsSequence = Array.from(this.bindings.values()).some(
        b => this.getEffectiveKey(b).startsWith(keyString + ' ')
      );

      if (startsSequence) {
        event.preventDefault();
        this.sequenceBuffer.push(keyString);
        this.sequenceTimeout = setTimeout(() => this.clearSequence(), 1000);
        return;
      }

      // Check for single key binding
      const binding = this.findBindingByKey(keyString);
      if (binding && this.checkContext(binding)) {
        event.preventDefault();
        this.executeBinding(binding, event);
      }
    });
  }

  private buildKeyString(combo: KeyCombo): string {
    const parts: string[] = [];
    if (combo.ctrl) parts.push('ctrl');
    if (combo.alt) parts.push('alt');
    if (combo.shift) parts.push('shift');
    if (combo.meta) parts.push('meta');
    parts.push(combo.key);
    return parts.join('+');
  }

  private getEffectiveKey(binding: KeyBinding): string {
    if (this.isMac && binding.mac) {
      return binding.mac.replace('cmd', 'meta').replace('option', 'alt');
    }
    return binding.key;
  }

  private findBindingByKey(keyString: string): KeyBinding | undefined {
    for (const binding of this.bindings.values()) {
      const effectiveKey = this.getEffectiveKey(binding);
      if (effectiveKey === keyString) {
        return binding;
      }
    }
    return undefined;
  }

  private checkContext(binding: KeyBinding): boolean {
    if (!binding.when) return true;

    // Simple context evaluation
    const conditions = binding.when.split('&&').map(c => c.trim());
    return conditions.every(condition => {
      if (condition.startsWith('!')) {
        return !this.contexts.has(condition.slice(1));
      }
      return this.contexts.has(condition);
    });
  }

  private executeBinding(binding: KeyBinding, event: KeyboardEvent): void {
    const handler = this.handlers.get(binding.command);
    if (handler) {
      const result = handler(event);
      if (result === false) {
        // Handler returned false, allow default behavior
      }
    }
  }

  private clearSequence(): void {
    this.sequenceBuffer = [];
    if (this.sequenceTimeout) {
      clearTimeout(this.sequenceTimeout);
      this.sequenceTimeout = null;
    }
  }

  private loadDefaultBindings(): void {
    for (const binding of DEFAULT_KEYBINDINGS) {
      this.bindings.set(binding.id, { ...binding });
    }
  }

  private loadCustomBindings(): void {
    try {
      const stored = localStorage.getItem('custom-keybindings');
      if (stored) {
        const custom: KeyBinding[] = JSON.parse(stored);
        for (const binding of custom) {
          this.bindings.set(binding.id, binding);
        }
      }
    } catch {
      // Invalid stored bindings
    }
  }

  private saveCustomBindings(): void {
    const custom = Array.from(this.bindings.values()).filter(binding => {
      const defaultBinding = DEFAULT_KEYBINDINGS.find(b => b.id === binding.id);
      return !defaultBinding || defaultBinding.key !== binding.key;
    });

    try {
      localStorage.setItem('custom-keybindings', JSON.stringify(custom));
    } catch {
      // Storage unavailable
    }
  }
}

// ============== SINGLETON ==============
export const keyboardService = new KeyboardService();

// ============== REACT HOOKS ==============
import { useEffect, useCallback } from 'react';

export function useKeyboardShortcut(
  key: string,
  handler: () => void,
  deps: React.DependencyList = []
): void {
  useEffect(() => {
    const combo = keyboardService.parseKeyCombo(key);
    
    const unsubscribe = keyboardService.onKeyPress((pressed) => {
      if (
        pressed.key === combo.key &&
        pressed.ctrl === combo.ctrl &&
        pressed.shift === combo.shift &&
        pressed.alt === combo.alt &&
        pressed.meta === combo.meta
      ) {
        handler();
      }
    });

    return unsubscribe;
  }, [key, ...deps]);
}

export function useCommand(command: string, handler: () => void, deps: React.DependencyList = []): void {
  useEffect(() => {
    return keyboardService.registerCommand(command, handler);
  }, [command, ...deps]);
}

export function useKeyBindings() {
  const bindings = keyboardService.getBindings();
  const categories = keyboardService.getBindingsByCategory();

  const updateBinding = useCallback((id: string, key: string) => {
    keyboardService.updateBinding(id, key);
  }, []);

  const resetBinding = useCallback((id: string) => {
    keyboardService.resetBinding(id);
  }, []);

  const resetAll = useCallback(() => {
    keyboardService.resetAll();
  }, []);

  return {
    bindings,
    categories,
    updateBinding,
    resetBinding,
    resetAll,
    formatKey: keyboardService.formatKeyCombo.bind(keyboardService),
  };
}

export default keyboardService;
