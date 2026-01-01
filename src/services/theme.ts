// ============== THEME SERVICE ==============
// Theme management and UI customization

// ============== TYPES ==============
export interface Theme {
  id: string;
  name: string;
  type: 'light' | 'dark' | 'high-contrast';
  colors: ThemeColors;
  tokenColors?: TokenColor[];
  semanticHighlighting?: boolean;
}

export interface ThemeColors {
  // Editor colors
  'editor.background': string;
  'editor.foreground': string;
  'editor.lineHighlightBackground': string;
  'editor.selectionBackground': string;
  'editor.inactiveSelectionBackground': string;
  'editorCursor.foreground': string;
  'editorWhitespace.foreground': string;
  'editorLineNumber.foreground': string;
  'editorLineNumber.activeForeground': string;
  'editorIndentGuide.background': string;
  'editorIndentGuide.activeBackground': string;
  
  // UI colors
  'activityBar.background': string;
  'activityBar.foreground': string;
  'activityBar.inactiveForeground': string;
  'sideBar.background': string;
  'sideBar.foreground': string;
  'sideBarTitle.foreground': string;
  'panel.background': string;
  'panel.border': string;
  'panelTitle.activeBorder': string;
  'panelTitle.activeForeground': string;
  'panelTitle.inactiveForeground': string;
  'statusBar.background': string;
  'statusBar.foreground': string;
  'statusBar.border': string;
  'titleBar.activeBackground': string;
  'titleBar.activeForeground': string;
  'titleBar.inactiveBackground': string;
  'titleBar.inactiveForeground': string;
  
  // Tab colors
  'tab.activeBackground': string;
  'tab.activeForeground': string;
  'tab.inactiveBackground': string;
  'tab.inactiveForeground': string;
  'tab.border': string;
  'tab.activeBorder': string;
  'tab.activeBorderTop': string;
  
  // List colors
  'list.activeSelectionBackground': string;
  'list.activeSelectionForeground': string;
  'list.hoverBackground': string;
  'list.hoverForeground': string;
  'list.focusBackground': string;
  'list.focusForeground': string;
  
  // Input colors
  'input.background': string;
  'input.foreground': string;
  'input.border': string;
  'input.placeholderForeground': string;
  'inputOption.activeBackground': string;
  'inputOption.activeBorder': string;
  
  // Button colors
  'button.background': string;
  'button.foreground': string;
  'button.hoverBackground': string;
  'button.secondaryBackground': string;
  'button.secondaryForeground': string;
  'button.secondaryHoverBackground': string;
  
  // Scrollbar colors
  'scrollbar.shadow': string;
  'scrollbarSlider.background': string;
  'scrollbarSlider.hoverBackground': string;
  'scrollbarSlider.activeBackground': string;
  
  // Terminal colors
  'terminal.background': string;
  'terminal.foreground': string;
  'terminal.ansiBlack': string;
  'terminal.ansiRed': string;
  'terminal.ansiGreen': string;
  'terminal.ansiYellow': string;
  'terminal.ansiBlue': string;
  'terminal.ansiMagenta': string;
  'terminal.ansiCyan': string;
  'terminal.ansiWhite': string;
  'terminal.ansiBrightBlack': string;
  'terminal.ansiBrightRed': string;
  'terminal.ansiBrightGreen': string;
  'terminal.ansiBrightYellow': string;
  'terminal.ansiBrightBlue': string;
  'terminal.ansiBrightMagenta': string;
  'terminal.ansiBrightCyan': string;
  'terminal.ansiBrightWhite': string;
  
  // Notification colors
  'notifications.background': string;
  'notifications.foreground': string;
  'notifications.border': string;
  
  // Badge colors
  'badge.background': string;
  'badge.foreground': string;
  
  // Focus colors
  'focusBorder': string;
  'contrastBorder': string;
  
  // Additional colors
  [key: string]: string;
}

export interface TokenColor {
  name?: string;
  scope: string | string[];
  settings: {
    foreground?: string;
    background?: string;
    fontStyle?: string;
  };
}

type ThemeChangeHandler = (theme: Theme) => void;

// ============== DEFAULT THEMES ==============
const DARK_THEME: Theme = {
  id: 'default-dark',
  name: 'Default Dark+',
  type: 'dark',
  colors: {
    'editor.background': '#0a0a0a',
    'editor.foreground': '#d4d4d4',
    'editor.lineHighlightBackground': '#0a0a0a',
    'editor.selectionBackground': '#264f78',
    'editor.inactiveSelectionBackground': '#3a3d41',
    'editorCursor.foreground': '#aeafad',
    'editorWhitespace.foreground': '#3b3b3b',
    'editorLineNumber.foreground': '#858585',
    'editorLineNumber.activeForeground': '#c6c6c6',
    'editorIndentGuide.background': '#404040',
    'editorIndentGuide.activeBackground': '#707070',
    'activityBar.background': '#333333',
    'activityBar.foreground': '#ffffff',
    'activityBar.inactiveForeground': '#999999',
    'sideBar.background': '#0a0a0a',
    'sideBar.foreground': '#cccccc',
    'sideBarTitle.foreground': '#bbbbbb',
    'panel.background': '#0a0a0a',
    'panel.border': '#80808059',
    'panelTitle.activeBorder': '#e7e7e7',
    'panelTitle.activeForeground': '#e7e7e7',
    'panelTitle.inactiveForeground': '#e7e7e799',
    'statusBar.background': '#007acc',
    'statusBar.foreground': '#ffffff',
    'statusBar.border': '#00000000',
    'titleBar.activeBackground': '#3c3c3c',
    'titleBar.activeForeground': '#cccccc',
    'titleBar.inactiveBackground': '#3c3c3c99',
    'titleBar.inactiveForeground': '#cccccc99',
    'tab.activeBackground': '#0a0a0a',
    'tab.activeForeground': '#ffffff',
    'tab.inactiveBackground': '#0a0a0a',
    'tab.inactiveForeground': '#ffffff80',
    'tab.border': '#0a0a0a',
    'tab.activeBorder': '#00000000',
    'tab.activeBorderTop': '#007acc',
    'list.activeSelectionBackground': '#094771',
    'list.activeSelectionForeground': '#ffffff',
    'list.hoverBackground': '#0a0a0a',
    'list.hoverForeground': '#ffffff',
    'list.focusBackground': '#062f4a',
    'list.focusForeground': '#ffffff',
    'input.background': '#3c3c3c',
    'input.foreground': '#cccccc',
    'input.border': '#00000000',
    'input.placeholderForeground': '#a6a6a6',
    'inputOption.activeBackground': '#007fd466',
    'inputOption.activeBorder': '#007acc',
    'button.background': '#0e639c',
    'button.foreground': '#ffffff',
    'button.hoverBackground': '#1177bb',
    'button.secondaryBackground': '#3a3d41',
    'button.secondaryForeground': '#ffffff',
    'button.secondaryHoverBackground': '#45494e',
    'scrollbar.shadow': '#000000',
    'scrollbarSlider.background': '#79797966',
    'scrollbarSlider.hoverBackground': '#646464b3',
    'scrollbarSlider.activeBackground': '#bfbfbf66',
    'terminal.background': '#0a0a0a',
    'terminal.foreground': '#cccccc',
    'terminal.ansiBlack': '#000000',
    'terminal.ansiRed': '#cd3131',
    'terminal.ansiGreen': '#0dbc79',
    'terminal.ansiYellow': '#e5e510',
    'terminal.ansiBlue': '#2472c8',
    'terminal.ansiMagenta': '#bc3fbc',
    'terminal.ansiCyan': '#11a8cd',
    'terminal.ansiWhite': '#e5e5e5',
    'terminal.ansiBrightBlack': '#666666',
    'terminal.ansiBrightRed': '#f14c4c',
    'terminal.ansiBrightGreen': '#23d18b',
    'terminal.ansiBrightYellow': '#f5f543',
    'terminal.ansiBrightBlue': '#3b8eea',
    'terminal.ansiBrightMagenta': '#d670d6',
    'terminal.ansiBrightCyan': '#29b8db',
    'terminal.ansiBrightWhite': '#e5e5e5',
    'notifications.background': '#0a0a0a',
    'notifications.foreground': '#cccccc',
    'notifications.border': '#3c3c3c',
    'badge.background': '#4d4d4d',
    'badge.foreground': '#ffffff',
    'focusBorder': '#007fd4',
    'contrastBorder': '#00000000',
  },
  tokenColors: [
    { scope: 'comment', settings: { foreground: '#6A9955' } },
    { scope: 'string', settings: { foreground: '#CE9178' } },
    { scope: 'keyword', settings: { foreground: '#569CD6' } },
    { scope: 'constant.numeric', settings: { foreground: '#B5CEA8' } },
    { scope: 'constant.language', settings: { foreground: '#569CD6' } },
    { scope: 'variable', settings: { foreground: '#9CDCFE' } },
    { scope: 'entity.name.function', settings: { foreground: '#DCDCAA' } },
    { scope: 'entity.name.type', settings: { foreground: '#4EC9B0' } },
    { scope: 'entity.name.class', settings: { foreground: '#4EC9B0' } },
    { scope: 'storage.type', settings: { foreground: '#569CD6' } },
    { scope: 'support.type', settings: { foreground: '#4EC9B0' } },
    { scope: 'support.function', settings: { foreground: '#DCDCAA' } },
  ],
};

const LIGHT_THEME: Theme = {
  id: 'default-light',
  name: 'Default Light+',
  type: 'light',
  colors: {
    'editor.background': '#ffffff',
    'editor.foreground': '#000000',
    'editor.lineHighlightBackground': '#f0f0f0',
    'editor.selectionBackground': '#add6ff',
    'editor.inactiveSelectionBackground': '#e5ebf1',
    'editorCursor.foreground': '#000000',
    'editorWhitespace.foreground': '#d3d3d3',
    'editorLineNumber.foreground': '#237893',
    'editorLineNumber.activeForeground': '#0b216f',
    'editorIndentGuide.background': '#d3d3d3',
    'editorIndentGuide.activeBackground': '#939393',
    'activityBar.background': '#2c2c2c',
    'activityBar.foreground': '#ffffff',
    'activityBar.inactiveForeground': '#999999',
    'sideBar.background': '#f3f3f3',
    'sideBar.foreground': '#616161',
    'sideBarTitle.foreground': '#6f6f6f',
    'panel.background': '#f3f3f3',
    'panel.border': '#80808059',
    'panelTitle.activeBorder': '#424242',
    'panelTitle.activeForeground': '#424242',
    'panelTitle.inactiveForeground': '#42424299',
    'statusBar.background': '#007acc',
    'statusBar.foreground': '#ffffff',
    'statusBar.border': '#00000000',
    'titleBar.activeBackground': '#dddddd',
    'titleBar.activeForeground': '#333333',
    'titleBar.inactiveBackground': '#dddddd99',
    'titleBar.inactiveForeground': '#33333399',
    'tab.activeBackground': '#ffffff',
    'tab.activeForeground': '#333333',
    'tab.inactiveBackground': '#ececec',
    'tab.inactiveForeground': '#33333380',
    'tab.border': '#f3f3f3',
    'tab.activeBorder': '#00000000',
    'tab.activeBorderTop': '#007acc',
    'list.activeSelectionBackground': '#0060c0',
    'list.activeSelectionForeground': '#ffffff',
    'list.hoverBackground': '#e8e8e8',
    'list.hoverForeground': '#000000',
    'list.focusBackground': '#d6ebff',
    'list.focusForeground': '#000000',
    'input.background': '#ffffff',
    'input.foreground': '#616161',
    'input.border': '#cecece',
    'input.placeholderForeground': '#767676',
    'inputOption.activeBackground': '#007fd466',
    'inputOption.activeBorder': '#007acc',
    'button.background': '#007acc',
    'button.foreground': '#ffffff',
    'button.hoverBackground': '#0062a3',
    'button.secondaryBackground': '#5f6a79',
    'button.secondaryForeground': '#ffffff',
    'button.secondaryHoverBackground': '#4c5561',
    'scrollbar.shadow': '#dddddd',
    'scrollbarSlider.background': '#64646466',
    'scrollbarSlider.hoverBackground': '#646464b3',
    'scrollbarSlider.activeBackground': '#00000099',
    'terminal.background': '#ffffff',
    'terminal.foreground': '#333333',
    'terminal.ansiBlack': '#000000',
    'terminal.ansiRed': '#cd3131',
    'terminal.ansiGreen': '#00bc00',
    'terminal.ansiYellow': '#949800',
    'terminal.ansiBlue': '#0451a5',
    'terminal.ansiMagenta': '#bc05bc',
    'terminal.ansiCyan': '#0598bc',
    'terminal.ansiWhite': '#555555',
    'terminal.ansiBrightBlack': '#666666',
    'terminal.ansiBrightRed': '#cd3131',
    'terminal.ansiBrightGreen': '#14ce14',
    'terminal.ansiBrightYellow': '#b5ba00',
    'terminal.ansiBrightBlue': '#0451a5',
    'terminal.ansiBrightMagenta': '#bc05bc',
    'terminal.ansiBrightCyan': '#0598bc',
    'terminal.ansiBrightWhite': '#a5a5a5',
    'notifications.background': '#f3f3f3',
    'notifications.foreground': '#616161',
    'notifications.border': '#e7e7e7',
    'badge.background': '#c4c4c4',
    'badge.foreground': '#333333',
    'focusBorder': '#0090f1',
    'contrastBorder': '#00000000',
  },
  tokenColors: [
    { scope: 'comment', settings: { foreground: '#008000' } },
    { scope: 'string', settings: { foreground: '#a31515' } },
    { scope: 'keyword', settings: { foreground: '#0000ff' } },
    { scope: 'constant.numeric', settings: { foreground: '#098658' } },
    { scope: 'constant.language', settings: { foreground: '#0000ff' } },
    { scope: 'variable', settings: { foreground: '#001080' } },
    { scope: 'entity.name.function', settings: { foreground: '#795E26' } },
    { scope: 'entity.name.type', settings: { foreground: '#267f99' } },
    { scope: 'entity.name.class', settings: { foreground: '#267f99' } },
    { scope: 'storage.type', settings: { foreground: '#0000ff' } },
    { scope: 'support.type', settings: { foreground: '#267f99' } },
    { scope: 'support.function', settings: { foreground: '#795E26' } },
  ],
};

// ============== THEME SERVICE ==============
class ThemeService {
  private themes = new Map<string, Theme>();
  private activeTheme: Theme;
  private changeHandlers = new Set<ThemeChangeHandler>();
  private styleElement: HTMLStyleElement | null = null;

  constructor() {
    this.registerTheme(DARK_THEME);
    this.registerTheme(LIGHT_THEME);
    this.activeTheme = DARK_THEME;
    this.loadSavedTheme();
    this.applyTheme();
  }

  // Get all themes
  getThemes(): Theme[] {
    return Array.from(this.themes.values());
  }

  // Get theme by ID
  getTheme(id: string): Theme | undefined {
    return this.themes.get(id);
  }

  // Get active theme
  getActiveTheme(): Theme {
    return this.activeTheme;
  }

  // Set active theme
  setTheme(id: string): void {
    const theme = this.themes.get(id);
    if (!theme) throw new Error(`Theme not found: ${id}`);

    this.activeTheme = theme;
    this.applyTheme();
    this.saveTheme();
    this.notifyChange();
  }

  // Register custom theme
  registerTheme(theme: Theme): void {
    this.themes.set(theme.id, theme);
  }

  // Unregister theme
  unregisterTheme(id: string): void {
    if (id === this.activeTheme.id) {
      throw new Error('Cannot unregister active theme');
    }
    this.themes.delete(id);
  }

  // Get color value
  getColor(key: keyof ThemeColors): string {
    return this.activeTheme.colors[key] || '';
  }

  // Get all colors
  getColors(): ThemeColors {
    return { ...this.activeTheme.colors };
  }

  // Get token colors
  getTokenColors(): TokenColor[] {
    return this.activeTheme.tokenColors || [];
  }

  // Check if dark theme
  isDark(): boolean {
    return this.activeTheme.type === 'dark';
  }

  // Toggle between light and dark
  toggle(): void {
    const newTheme = this.isDark() ? 'default-light' : 'default-dark';
    this.setTheme(newTheme);
  }

  // Subscribe to theme changes
  onChange(handler: ThemeChangeHandler): () => void {
    this.changeHandlers.add(handler);
    return () => this.changeHandlers.delete(handler);
  }

  // Generate CSS variables
  getCSSVariables(): string {
    const vars: string[] = [];
    for (const [key, value] of Object.entries(this.activeTheme.colors)) {
      const cssVar = `--${key.replace(/\./g, '-')}`;
      vars.push(`${cssVar}: ${value};`);
    }
    return `:root { ${vars.join(' ')} }`;
  }

  private applyTheme(): void {
    // Apply CSS variables
    if (!this.styleElement) {
      this.styleElement = document.createElement('style');
      this.styleElement.id = 'theme-variables';
      document.head.appendChild(this.styleElement);
    }
    this.styleElement.textContent = this.getCSSVariables();

    // Update body class
    document.body.classList.remove('theme-light', 'theme-dark', 'theme-high-contrast');
    document.body.classList.add(`theme-${this.activeTheme.type}`);

    // Update meta theme-color
    let metaTheme = document.querySelector('meta[name="theme-color"]');
    if (!metaTheme) {
      metaTheme = document.createElement('meta');
      metaTheme.setAttribute('name', 'theme-color');
      document.head.appendChild(metaTheme);
    }
    metaTheme.setAttribute('content', this.activeTheme.colors['titleBar.activeBackground']);
  }

  private loadSavedTheme(): void {
    try {
      const saved = localStorage.getItem('active-theme');
      if (saved && this.themes.has(saved)) {
        this.activeTheme = this.themes.get(saved)!;
      }
    } catch {
      // Use default
    }
  }

  private saveTheme(): void {
    try {
      localStorage.setItem('active-theme', this.activeTheme.id);
    } catch {
      // Storage unavailable
    }
  }

  private notifyChange(): void {
    this.changeHandlers.forEach(handler => handler(this.activeTheme));
  }
}

// ============== SINGLETON ==============
export const themeService = new ThemeService();

// ============== REACT HOOKS ==============
import { useState, useEffect, useCallback, useMemo } from 'react';

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(themeService.getActiveTheme());

  useEffect(() => {
    const unsubscribe = themeService.onChange(setTheme);
    return unsubscribe;
  }, []);

  const setThemeById = useCallback((id: string) => {
    themeService.setTheme(id);
  }, []);

  const toggle = useCallback(() => {
    themeService.toggle();
  }, []);

  return {
    theme,
    themes: themeService.getThemes(),
    setTheme: setThemeById,
    toggle,
    isDark: theme.type === 'dark',
  };
}

export function useThemeColor(key: keyof ThemeColors): string {
  const [color, setColor] = useState(themeService.getColor(key));

  useEffect(() => {
    const unsubscribe = themeService.onChange(() => {
      setColor(themeService.getColor(key));
    });
    return unsubscribe;
  }, [key]);

  return color;
}

export function useThemeColors(): ThemeColors {
  const [colors, setColors] = useState(themeService.getColors());

  useEffect(() => {
    const unsubscribe = themeService.onChange(() => {
      setColors(themeService.getColors());
    });
    return unsubscribe;
  }, []);

  return colors;
}

export function useTokenColors(): TokenColor[] {
  const [tokenColors, setTokenColors] = useState(themeService.getTokenColors());

  useEffect(() => {
    const unsubscribe = themeService.onChange(() => {
      setTokenColors(themeService.getTokenColors());
    });
    return unsubscribe;
  }, []);

  return tokenColors;
}

export default themeService;
