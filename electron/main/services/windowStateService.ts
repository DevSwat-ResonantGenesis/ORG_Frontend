import { BrowserWindow } from 'electron';
import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

export interface WindowState {
  x: number;
  y: number;
  width: number;
  height: number;
  isMaximized: boolean;
  isFullScreen: boolean;
}

export class WindowStateService {
  private stateFilePath: string;
  private windowStates: Map<string, WindowState> = new Map();

  constructor() {
    const userDataPath = app.getPath('userData');
    this.stateFilePath = path.join(userDataPath, 'window-state.json');
    this.loadWindowStates();
  }

  /**
   * Save window state
   */
  saveWindowState(windowId: string, window: BrowserWindow): void {
    const bounds = window.getBounds();
    const isMaximized = window.isMaximized();
    const isFullScreen = window.isFullScreen();

    const state: WindowState = {
      x: bounds.x,
      y: bounds.y,
      width: bounds.width,
      height: bounds.height,
      isMaximized,
      isFullScreen,
    };

    this.windowStates.set(windowId, state);
    this.persistWindowStates();
  }

  /**
   * Restore window state
   */
  restoreWindowState(windowId: string, window: BrowserWindow, defaultBounds: {
    width: number;
    height: number;
  }): void {
    const state = this.windowStates.get(windowId);

    if (state) {
      // Validate bounds (make sure window is visible on screen)
      const { x, y, width, height } = this.validateBounds(state);

      window.setBounds({
        x,
        y,
        width: width || defaultBounds.width,
        height: height || defaultBounds.height,
      });

      // Restore maximized state (after bounds are set)
      if (state.isMaximized && !state.isFullScreen) {
        window.maximize();
      }

      // Fullscreen should be handled separately by user
    } else {
      // Use default bounds
      window.setBounds(defaultBounds);
      window.center();
    }
  }

  /**
   * Validate window bounds to ensure they're on screen
   */
  private validateBounds(state: WindowState): { x: number; y: number; width: number; height: number } {
    const { screen } = require('electron');
    const displays = screen.getAllDisplays();

    // Find the display that contains or is closest to the window
    let targetDisplay = displays[0];

    for (const display of displays) {
      const { x, y, width, height } = display.bounds;
      if (
        state.x >= x &&
        state.y >= y &&
        state.x < x + width &&
        state.y < y + height
      ) {
        targetDisplay = display;
        break;
      }
    }

    const { x: displayX, y: displayY, width: displayWidth, height: displayHeight } = targetDisplay.bounds;

    // Ensure window is within display bounds
    const x = Math.max(displayX, Math.min(state.x, displayX + displayWidth - state.width));
    const y = Math.max(displayY, Math.min(state.y, displayY + displayHeight - state.height));

    // Ensure minimum size
    const width = Math.max(state.width, 800);
    const height = Math.max(state.height, 600);

    return { x, y, width, height };
  }

  /**
   * Load window states from disk
   */
  private loadWindowStates(): void {
    try {
      if (fs.existsSync(this.stateFilePath)) {
        const data = fs.readFileSync(this.stateFilePath, 'utf-8');
        const states = JSON.parse(data);
        this.windowStates = new Map(Object.entries(states));
      }
    } catch (error) {
      console.error('Failed to load window states:', error);
    }
  }

  /**
   * Persist window states to disk
   */
  private persistWindowStates(): void {
    try {
      const states = Object.fromEntries(this.windowStates);
      fs.writeFileSync(this.stateFilePath, JSON.stringify(states, null, 2));
    } catch (error) {
      console.error('Failed to persist window states:', error);
    }
  }

  /**
   * Clear saved state for a window
   */
  clearWindowState(windowId: string): void {
    this.windowStates.delete(windowId);
    this.persistWindowStates();
  }

  /**
   * Clear all window states
   */
  clearAllStates(): void {
    this.windowStates.clear();
    try {
      if (fs.existsSync(this.stateFilePath)) {
        fs.unlinkSync(this.stateFilePath);
      }
    } catch (error) {
      console.error('Failed to clear window states:', error);
    }
  }
}

