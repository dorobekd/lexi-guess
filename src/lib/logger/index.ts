import type { Logger, RequestContext } from './types';
import { serverLogger } from './serverLogger';
import { clientLogger } from './clientLogger';

// Use appropriate logger based on environment
export const logger = typeof window === 'undefined' ? serverLogger : clientLogger;

/**
 * Helper function for request context in server-side code
 */
export async function withRequestContext<T>(
  context: Partial<RequestContext>, 
  fn: (logger: Logger) => Promise<T>
): Promise<T> {
  const requestId = context.requestId || crypto.randomUUID();
  const childLogger = serverLogger.child({
    ...context,
    requestId
  });

  return fn(childLogger);
}

/**
 * Helper function for component context in client-side code
 */
export function withComponentContext(componentName: string): Logger {
  return clientLogger.child({
    component: componentName
  });
}

export type { Logger, RequestContext };
export { serverLogger, clientLogger }; 