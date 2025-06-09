import winston from 'winston';
import path from 'path';
import type { LoggerOptions, Logger, LogMetadata } from './types';

interface ErrorWithCode extends Error {
  code?: string;
}

interface LogEntry extends winston.Logform.TransformableInfo {
  timestamp?: string;
  service?: string;
  environment?: string;
  error?: Error;
  [key: string]: unknown;
}

const LOG_FORMAT = winston.format.printf((info: LogEntry) => {
  const { level, message, timestamp, ...metadata } = info;
  
  // Ensure consistent metadata structure
  const standardMeta: Partial<LogMetadata> = {
    timestamp: timestamp || new Date().toISOString(),
    service: metadata.service as string || 'unknown',
    environment: metadata.environment as string || 'unknown',
    ...metadata
  };

  // Format error objects consistently
  if (metadata.error) {
    const error = metadata.error as ErrorWithCode;
    standardMeta.error = {
      message: error.message || String(error),
      code: error.code,
      stack: error.stack
    };
  }

  // Create consistent log format
  return JSON.stringify({
    level,
    message: message as string,
    ...standardMeta
  });
});

/**
 * Creates a configured Winston logger instance with standardized formatting
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
      LOG_FORMAT
    ),
    transports: [
      // Console transport with pretty printing for development
      ...(options.enableConsole !== false ? [
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.align(),
            options.environment === 'development' 
              ? winston.format.prettyPrint()
              : LOG_FORMAT
          )
        })
      ] : []),
      // File transports with JSON format
      ...(options.enableFile && options.logDirectory ? [
        new winston.transports.File({
          filename: path.join(options.logDirectory, 'error.log'),
          level: 'error',
          format: LOG_FORMAT,
          maxsize: 5242880, // 5MB
          maxFiles: 5
        }),
        new winston.transports.File({
          filename: path.join(options.logDirectory, 'combined.log'),
          format: LOG_FORMAT,
          maxsize: 5242880,
          maxFiles: 5
        })
      ] : [])
    ],
    // Exception handling
    exceptionHandlers: options.enableFile ? [
      new winston.transports.File({ 
        filename: path.join(options.logDirectory || process.cwd(), 'exceptions.log'),
        format: LOG_FORMAT
      })
    ] : undefined,
    rejectionHandlers: options.enableFile ? [
      new winston.transports.File({ 
        filename: path.join(options.logDirectory || process.cwd(), 'rejections.log'),
        format: LOG_FORMAT
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