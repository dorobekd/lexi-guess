import { NextRequest } from 'next/server';

interface RateLimitResult {
  success: boolean;
  headers: {
    'X-RateLimit-Limit': string;
    'X-RateLimit-Remaining': string;
    'X-RateLimit-Reset': string;
  };
}

//Consider using Redis for rate limiting in production
export class RateLimiterService {
  private limits: Map<string, { count: number; resetTime: number }> = new Map();

  private getClientIdentifier(request: NextRequest): string {
    // Try to get IP from various headers
    const forwardedFor = request.headers.get('x-forwarded-for')?.split(',')[0];
    const realIp = request.headers.get('x-real-ip');
    return forwardedFor || realIp || 'unknown';
  }

  public async checkLimit(
    request: NextRequest,
    action: 'init' | 'guess',
    limit: number
  ): Promise<RateLimitResult> {
    const clientId = this.getClientIdentifier(request);
    const key = `${clientId}-${action}`;
    const now = Date.now();
    const windowMs = 60 * 1000; // 1 minute window
    const resetTime = Math.ceil(now / windowMs) * windowMs;

    // Clean up expired entries
    for (const [storedKey, data] of this.limits.entries()) {
      if (data.resetTime <= now) {
        this.limits.delete(storedKey);
      }
    }

    // Get or create limit data
    let limitData = this.limits.get(key);
    if (!limitData || limitData.resetTime <= now) {
      limitData = { count: 0, resetTime };
    }

    // Check if limit is exceeded
    const remaining = Math.max(0, limit - limitData.count);
    const success = limitData.count < limit;

    // Update count if within limit
    if (success) {
      limitData.count++;
      this.limits.set(key, limitData);
    }

    return {
      success,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': (Math.ceil((resetTime - now) / 1000)).toString()
      }
    };
  }
}

// Export singleton instances for different rate limits
export const guessRateLimiter = new RateLimiterService();  // Default rate limiter
export const initRateLimiter = new RateLimiterService();    // Default rate limiter 