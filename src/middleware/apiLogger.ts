import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { serverLogger } from '@/lib/logger';
import type { RequestContext } from '@/lib/logger/types';

/**
 * Creates request context from a Next.js request
 */
function createRequestContext(request: NextRequest): RequestContext {
  return {
    requestId: crypto.randomUUID(),
    method: request.method,
    url: request.url,
    path: request.nextUrl.pathname,
    userAgent: request.headers.get('user-agent'),
    query: Object.fromEntries(request.nextUrl.searchParams),
    timestamp: new Date().toISOString()
  };
}

/**
 * Next.js middleware for API request logging.
 * - Generates and tracks request IDs
 * - Logs incoming API requests with timing
 * - Adds request ID to response headers for tracing
 */
export async function middleware(request: NextRequest) {
  const context = createRequestContext(request);
  const startTime = Date.now();

  // Create response and add tracing header
  const response = NextResponse.next();
  response.headers.set('x-request-id', context.requestId);

  // Log request with context
  const logger = serverLogger.child(context);
  logger.info('API request started');

  // Add timing information on response
  response.headers.set('x-response-time', `${Date.now() - startTime}ms`);
  logger.debug('API request completed', {
    duration: Date.now() - startTime
  });

  return response;
}

/**
 * Only run this middleware on API routes
 */
export const config = {
  matcher: '/api/:path*'
}; 