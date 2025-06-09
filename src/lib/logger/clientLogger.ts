'use client';

import pino from 'pino';
import type { Logger } from './types';

/**
 * Creates a browser-compatible Pino logger instance
 */
export function createClientLogger(): Logger {
  const env = typeof window !== 'undefined' 
    ? window.location.hostname === 'localhost' ? 'development' : 'production'
    : 'SSR';

  const options: pino.LoggerOptions = {
    level: env === 'development' ? 'debug' : 'info',
    base: {
      service: 'lexi-guess-client',
      environment: env,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'SSR',
      platform: typeof window !== 'undefined' ? window.navigator.platform : 'SSR'
    },
    browser: {
      asObject: true,
      write: {
        debug: (o) => console.debug(JSON.stringify(o, null, 2)),
        info: (o) => console.info(JSON.stringify(o, null, 2)),
        warn: (o) => console.warn(JSON.stringify(o, null, 2)),
        error: (o) => console.error(JSON.stringify(o, null, 2))
      }
    }
  };

  return pino(options);
}

// Export singleton instance
export const clientLogger = createClientLogger(); 