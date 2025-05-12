interface RateLimitConfig {
  windowMs: number;
  maxRequests: number;
}

class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private readonly windowMs: number;
  private readonly maxRequests: number;

  constructor({ windowMs, maxRequests }: RateLimitConfig) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  public async isRateLimited(ip: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this IP
    let requests = this.requests.get(ip) || [];
    
    // Filter out old requests
    requests = requests.filter(timestamp => timestamp > windowStart);
    
    // Check if rate limit is exceeded
    if (requests.length >= this.maxRequests) {
      return true;
    }

    // Add current request
    requests.push(now);
    this.requests.set(ip, requests);

    return false;
  }

  public getRemainingRequests(ip: string): number {
    const now = Date.now();
    const windowStart = now - this.windowMs;
    const requests = this.requests.get(ip) || [];
    const validRequests = requests.filter(timestamp => timestamp > windowStart);
    return Math.max(0, this.maxRequests - validRequests.length);
  }
}

// Create default rate limiter instance
export const rateLimiter = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100 // 100 requests per window
});