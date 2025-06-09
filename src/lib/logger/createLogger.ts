import winston from 'winston';
import path from 'path';
import type { LoggerOptions, Logger } from './types';

/**
 * Creates a configured Winston logger instance
 */
export function createLogger(options: LoggerOptions): Logger {
  return winston.createLogger({
    level: options.level || 'info',
    levels: winston.config.npm.levels,
    defaultMeta: {
      service: options.service,
      environment: options.environment,
      ...options.defaultMeta
    },
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.json()
    ),
    transports: [
      // Console transport
      ...(options.enableConsole !== false ? [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.align(),
            winston.format.cli()
          )
        })
      ] : []),
      // File transports
      ...(options.enableFile && options.logDirectory ? [
        new winston.transports.File({
          filename: path.join(options.logDirectory, 'error.log'),
          level: 'error',
          maxsize: 5242880,
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: path.join(options.logDirectory, 'combined.log'),
          maxsize: 5242880,
          maxFiles: 5
        })
      ] : [])
    ],
    // Exception handling
    exceptionHandlers: options.enableFile ? [
      new winston.transports.File({ 
        filename: path.join(options.logDirectory || process.cwd(), 'exceptions.log')
      })
    ] : undefined,
    rejectionHandlers: options.enableFile ? [
      new winston.transports.File({ 
        filename: path.join(options.logDirectory || process.cwd(), 'rejections.log')
      })
    ] : undefined,
    // Don't exit on error
    exitOnError: false
  });
}

/**
 * Creates a server-side logger instance
 */
export function createServerLogger(): Logger {
  const level = process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error' | undefined;
  const env = process.env.NODE_ENV || 'development';

  return createLogger({
    level: level || (env === 'development' ? 'debug' : 'info'),
    service: 'lexi-guess-server',
    environment: env,
    enableConsole: true,
    enableFile: env === 'production',
    logDirectory: process.env.LOG_DIR || path.join(process.cwd(), 'logs'),
    defaultMeta: {
      nodeVersion: process.version,
      processId: process.pid
    }
  });
}

/**
 * Creates a client-side logger instance
 */
export function createClientLogger(): Logger {
  const env = typeof window !== 'undefined' 
    ? window.location.hostname === 'localhost' ? 'development' : 'production'
    : 'SSR';

  return createLogger({
    level: env === 'development' ? 'debug' : 'info',
    service: 'lexi-guess-client',
    environment: env,
    enableConsole: true,
    enableFile: false,
    defaultMeta: {
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      platform: typeof window !== 'undefined' ? window.navigator.platform : 'SSR',
      clientId: getClientId()
    }
  });
}

function getClientId(): string {
  if (typeof window === 'undefined') return 'SSR';
  
  let clientId = sessionStorage.getItem('clientId');
  if (!clientId) {
    clientId = crypto.randomUUID();
    sessionStorage.setItem('clientId', clientId);
  }
  return clientId;
} 