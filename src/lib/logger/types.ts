import type { Logger as PinoLogger } from 'pino';

export interface RequestContext {
  requestId?: string;
  path?: string;
  service?: string;
  method?: string;
  [key: string]: unknown;
}

export interface LogMetadata {
  // Standard fields that should be included in every log
  timestamp?: string;
  correlationId?: string;
  service: string;
  environment: string;
  
  // Optional fields for additional context
  component?: string;
  operation?: string;
  duration?: number;
  userId?: string;
  
  // Error specific fields
  error?: {
    message: string;
    code?: string;
    stack?: string;
  };
  
  // Allow additional custom fields
  [key: string]: unknown;
}

export type Logger = PinoLogger;

export interface BaseLogger {
  debug(message: string, meta?: Record<string, unknown>): void;
  info(message: string, meta?: Record<string, unknown>): void;
  warn(message: string, meta?: Record<string, unknown>): void;
  error(message: string, meta?: Record<string, unknown>): void;
  child(options: Record<string, unknown>): BaseLogger;
}

// Server-side logger options
export interface LoggerOptions {
  level?: string;
  service: string;
  environment: string;
  defaultMeta?: Record<string, unknown>;
} 