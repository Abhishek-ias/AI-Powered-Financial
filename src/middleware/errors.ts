// ============================================================
// Error Handling Middleware
// ============================================================
import { Request, Response, NextFunction } from 'express';
import { errorResponse, ErrorCodes } from '../utils/response';

export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 400,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  // Structured logging (no secrets)
  console.error(JSON.stringify({
    timestamp: new Date().toISOString(),
    level: 'ERROR',
    requestId: (req as any).requestId || 'unknown',
    route: `${req.method} ${req.path}`,
    error: err.message,
    code: err instanceof AppError ? err.code : 'INTERNAL_ERROR',
  }));

  if (err instanceof AppError) {
    errorResponse(res, err.code, err.message, err.statusCode, err.details);
    return;
  }

  // Do not expose stack traces or internal details
  errorResponse(res, ErrorCodes.INTERNAL_ERROR, 'An internal error occurred.', 500);
}

export function notFoundHandler(req: Request, res: Response): void {
  errorResponse(res, ErrorCodes.NOT_FOUND, `Route ${req.method} ${req.path} not found.`, 404);
}
