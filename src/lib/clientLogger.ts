type LogLevel = 'debug' | 'info' | 'warn' | 'error';

interface LoggerOptions {
  level?: LogLevel;
  service?: string;
}

type LogMeta = Record<string, unknown>;

class ClientLogger {
  private level: LogLevel;
  private service: string;
  private icons: Record<LogLevel, string> = {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌'
  };

  constructor(options: LoggerOptions = {}) {
    this.level = options.level || 'info';
    this.service = options.service || 'client';
  }

  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3
    };
    return levels[level] >= levels[this.level];
  }

  private formatMessage(level: LogLevel, message: string, meta?: LogMeta): string {
    const timestamp = new Date().toISOString();
    const metaStr = meta ? JSON.stringify(meta, null, 2) : '';
    return `[${timestamp}] ${this.icons[level]} ${level.toUpperCase()} [${this.service}]: ${message} ${metaStr}`;
  }

  debug(message: string, meta?: LogMeta) {
    if (this.shouldLog('debug')) {
      console.debug(this.formatMessage('debug', message, meta));
    }
  }

  info(message: string, meta?: LogMeta) {
    if (this.shouldLog('info')) {
      console.info(this.formatMessage('info', message, meta));
    }
  }

  warn(message: string, meta?: LogMeta) {
    if (this.shouldLog('warn')) {
      console.warn(this.formatMessage('warn', message, meta));
    }
  }

  error(message: string, meta?: LogMeta) {
    if (this.shouldLog('error')) {
      console.error(this.formatMessage('error', message, meta));
    }
  }
}

export const logger = new ClientLogger({
  level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
  service: 'lexi-guess-client'
}); 