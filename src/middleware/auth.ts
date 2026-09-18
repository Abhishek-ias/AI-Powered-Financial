// ============================================================
// Authentication Middleware (Simplified for Prototype)
// ============================================================
import { Request, Response, NextFunction } from 'express';
import { errorResponse, ErrorCodes } from '../utils/response';
import { UserRole } from '../types';

// Simplified auth — accepts user info from headers for prototype
// In production: JWT validation, session management, etc.
export function authMiddleware(req: Request, res: Response, next: NextFunction): void {
  // For prototype: accept userId and role from headers
  const userId = req.headers['x-user-id'] as string;
  const userRole = (req.headers['x-user-role'] as UserRole) || 'CUSTOMER';

  if (!userId) {
    errorResponse(res, ErrorCodes.UNAUTHORIZED, 'Authentication required. Provide X-User-Id header.', 401);
    return;
  }

  const validRoles: UserRole[] = ['CUSTOMER', 'AGENT', 'ADMIN'];
  if (!validRoles.includes(userRole)) {
    errorResponse(res, ErrorCodes.UNAUTHORIZED, 'Invalid role.', 401);
    return;
  }

  (req as any).userId = userId;
  (req as any).userRole = userRole;
  next();
}

// Authorization: require specific roles
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req as any).userRole as UserRole;
    if (!roles.includes(userRole)) {
      errorResponse(res, ErrorCodes.FORBIDDEN, 'Insufficient permissions.', 403);
      return;
    }
    next();
  };
}
