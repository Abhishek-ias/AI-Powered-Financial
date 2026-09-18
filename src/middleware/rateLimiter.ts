// ============================================================
// Rate Limiter — Simple in-memory rate limiting
// ============================================================
import { Request, Response, NextFunction } from 'express';
import { errorResponse, ErrorCodes } from '../utils/response';

interface RateEntry {
  count: number;
  resetAt: number;
}

const store = new Map<string, RateEntry>();

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store) {
    if (entry.resetAt < now) store.delete(key);
  }
}, 60 * 1000);

export function rateLimiter(windowMs: number = 60 * 1000, maxRequests: number = 100) {
  return (req: Request, res: Response, next: NextFunction) => {
    const key = (req as any).userId || req.ip || 'anonymous';
    const now = Date.now();

    const entry = store.get(key);
    if (!entry || entry.resetAt < now) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', maxRequests.toString());
      res.setHeader('X-RateLimit-Remaining', (maxRequests - 1).toString());
      next();
      return;
    }

    entry.count++;
    const remaining = Math.max(0, maxRequests - entry.count);
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', remaining.toString());
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000).toString());

    if (entry.count > maxRequests) {
      errorResponse(res, ErrorCodes.INVALID_REQUEST, 'Rate limit exceeded. Please try again later.', 429);
      return;
    }

    next();
  };
}
