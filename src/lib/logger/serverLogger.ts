import pino from 'pino';
import type { Logger } from './types';

interface ErrorWithCode extends Error {
  code?: string;
}

interface LogMetadata {
  [key: string]: unknown;
}

type LogArgs = [message: string, metadata?: LogMetadata, ...args: unknown[]];

/**
 * Creates a server-side logger instance
 */
export function createServerLogger(): Logger {
  const level = process.env.LOG_LEVEL as 'debug' | 'info' | 'warn' | 'error' | undefined;
  const env = process.env.NODE_ENV || 'development';
  const isDev = env === 'development';

  const options: pino.LoggerOptions = {
    level: level || (isDev ? 'debug' : 'info'),
    base: {
      service: 'lexi-guess-server',
      environment: env,
    },
    timestamp: () => `,"time":"${new Date(Date.now()).toISOString()}"`,
    formatters: {
      level: (label) => ({ level: label.toUpperCase() }),
      bindings: (bindings) => bindings,
      log: (obj) => {
        // Move message to the front for better readability
        const { msg, ...rest } = obj;
        return { msg, ...rest };
      }
    },
    messageKey: 'msg', // Use 'msg' instead of default 'message' for shorter output
    serializers: isDev ? {
      error: (error: ErrorWithCode) => ({
        type: error.constructor.name,
        message: error.message,
        stack: error.stack?.split('\n'),
        code: error.code
      }),
      req: (req) => ({
        method: req.method,
        url: req.url,
        path: req.path,
        params: req.params,
        // Only include important headers
        headers: {
          'user-agent': req.headers['user-agent'],
          'content-type': req.headers['content-type'],
          'accept': req.headers['accept']
        }
      })
    } : undefined
  };

  // In development, customize the output for better readability
  if (isDev) {
    return pino({
      ...options,
      // Custom formatting for development
      hooks: {
        logMethod(inputArgs: LogArgs, method: (this: Logger, ...args: LogArgs) => void) {
          if (inputArgs.length >= 2) {
            const [firstArg, secondArg, ...rest] = inputArgs;
            
            // If the first argument is an object, assume it's metadata
            if (typeof firstArg === 'object' && firstArg !== null) {
              // Move message to front if it exists in metadata
              const { msg, message, ...metadata } = firstArg as LogMetadata;
              if (msg || message) {
                return method.apply(this, [(msg || message) as string, { ...metadata, ...secondArg }, ...rest]);
              }
            }
          }
          return method.apply(this, inputArgs);
        }
      }
    });
  }

  return pino(options);
}

// Export singleton instance
export const serverLogger = createServerLogger(); 