// ============== STRUCTURED LOGGER ==============
// Centralized logging with structured output

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: Date;
  level: LogLevel;
  source: string;
  message: string;
  data?: Record<string, unknown>;
  traceId?: string;
  agentId?: string;
  executionId?: string;
}

interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
  maxBufferSize: number;
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

class Logger {
  private config: LoggerConfig = {
    minLevel: 'info',
    enableConsole: true,
    enableRemote: false,
    maxBufferSize: 1000,
  };
  
  private buffer: LogEntry[] = [];
  private listeners: Set<(entry: LogEntry) => void> = new Set();

  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private createEntry(
    level: LogLevel,
    source: string,
    message: string,
    data?: Record<string, unknown>
  ): LogEntry {
    return {
      timestamp: new Date(),
      level,
      source,
      message,
      data,
    };
  }

  private emit(entry: LogEntry): void {
    // Add to buffer
    this.buffer.push(entry);
    if (this.buffer.length > this.config.maxBufferSize) {
      this.buffer.shift();
    }

    // Console output
    if (this.config.enableConsole) {
      const prefix = `[${entry.timestamp.toISOString()}] [${entry.level.toUpperCase()}] [${entry.source}]`;
      const args = [prefix, entry.message];
      if (entry.data) args.push(entry.data as unknown as string);

      switch (entry.level) {
        case 'debug':
          console.debug(...args);
          break;
        case 'info':
          console.info(...args);
          break;
        case 'warn':
          console.warn(...args);
          break;
        case 'error':
          console.error(...args);
          break;
      }
    }

    // Remote logging
    if (this.config.enableRemote && this.config.remoteEndpoint) {
      this.sendRemote(entry);
    }

    // Notify listeners
    this.listeners.forEach(listener => {
      try {
        listener(entry);
      } catch (err) {
        console.error('Logger listener error:', err);
      }
    });
  }

  private async sendRemote(entry: LogEntry): Promise<void> {
    if (!this.config.remoteEndpoint) return;
    
    try {
      await fetch(this.config.remoteEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(entry),
      });
    } catch (err) {
      console.error('Failed to send log to remote:', err);
    }
  }

  debug(source: string, message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog('debug')) return;
    this.emit(this.createEntry('debug', source, message, data));
  }

  info(source: string, message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog('info')) return;
    this.emit(this.createEntry('info', source, message, data));
  }

  warn(source: string, message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog('warn')) return;
    this.emit(this.createEntry('warn', source, message, data));
  }

  error(source: string, message: string, data?: Record<string, unknown>): void {
    if (!this.shouldLog('error')) return;
    this.emit(this.createEntry('error', source, message, data));
  }

  // Create a scoped logger for a specific source
  scope(source: string): ScopedLogger {
    return new ScopedLogger(this, source);
  }

  // Subscribe to log entries
  subscribe(listener: (entry: LogEntry) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  // Get buffered logs
  getBuffer(filter?: { level?: LogLevel; source?: string; limit?: number }): LogEntry[] {
    let entries = [...this.buffer];
    
    if (filter?.level) {
      entries = entries.filter(e => e.level === filter.level);
    }
    if (filter?.source) {
      entries = entries.filter(e => e.source === filter.source);
    }
    if (filter?.limit) {
      entries = entries.slice(-filter.limit);
    }
    
    return entries;
  }

  clearBuffer(): void {
    this.buffer = [];
  }
}

class ScopedLogger {
  constructor(private logger: Logger, private source: string) {}

  debug(message: string, data?: Record<string, unknown>): void {
    this.logger.debug(this.source, message, data);
  }

  info(message: string, data?: Record<string, unknown>): void {
    this.logger.info(this.source, message, data);
  }

  warn(message: string, data?: Record<string, unknown>): void {
    this.logger.warn(this.source, message, data);
  }

  error(message: string, data?: Record<string, unknown>): void {
    this.logger.error(this.source, message, data);
  }
}

// Singleton instance
export const logger = new Logger();

export default logger;
