// External module declarations
declare module 'playwright' {
  export interface Browser {
    newContext(): Promise<BrowserContext>;
    close(): Promise<void>;
  }
  export interface BrowserContext {
    newPage(): Promise<Page>;
    close(): Promise<void>;
  }
  export interface Page {
    goto(url: string): Promise<void>;
    screenshot(options?: { path?: string; fullPage?: boolean }): Promise<Buffer>;
    evaluate<T>(fn: () => T): Promise<T>;
    close(): Promise<void>;
    $eval<T>(selector: string, fn: (el: Element) => T): Promise<T>;
    $$eval<T>(selector: string, fn: (els: Element[]) => T): Promise<T>;
  }
  export const chromium: {
    launch(options?: { headless?: boolean }): Promise<Browser>;
  };
}

declare module 'lighthouse' {
  interface LighthouseResult {
    lhr: {
      categories: Record<string, { score: number }>;
      audits: Record<string, { score: number; numericValue?: number }>;
    };
  }
  function lighthouse(url: string, options?: object, config?: object): Promise<LighthouseResult>;
  export default lighthouse;
}

declare module 'chrome-launcher' {
  export interface LaunchedChrome {
    port: number;
    kill(): Promise<void>;
  }
  export function launch(options?: { chromeFlags?: string[] }): Promise<LaunchedChrome>;
}

declare module 'ws' {
  import { EventEmitter } from 'events';
  
  export class WebSocket extends EventEmitter {
    constructor(url: string);
    send(data: string): void;
    close(): void;
    readyState: number;
    static OPEN: number;
  }
  
  export class WebSocketServer extends EventEmitter {
    constructor(options: { port: number });
    clients: Set<WebSocket>;
    close(): void;
  }
}
