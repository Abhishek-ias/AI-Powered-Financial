// ============================================================
// API Response Utilities
// ============================================================
import { Response } from 'express';
import { ApiResponse, ApiError } from '../types';

export function successResponse<T>(res: Response, data: T, statusCode = 200): void {
  const requestId = (res.req as any).requestId || 'unknown';
  const response: ApiResponse<T> = {
    success: true,
    data,
    error: null,
    requestId,
  };
  res.status(statusCode).json(response);
}

export function errorResponse(
  res: Response,
  code: string,
  message: string,
  statusCode = 400,
  details?: Record<string, unknown>
): void {
  const requestId = (res.req as any).requestId || 'unknown';
  const error: ApiError = { code, message, details };
  const response: ApiResponse = {
    success: false,
    data: null,
    error,
    requestId,
  };
  res.status(statusCode).json(response);
}

// Standard error codes
export const ErrorCodes = {
  INVALID_REQUEST: 'INVALID_REQUEST',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  JOURNEY_NOT_FOUND: 'JOURNEY_NOT_FOUND',
  INVALID_STATE_TRANSITION: 'INVALID_STATE_TRANSITION',
  CONSENT_REQUIRED: 'CONSENT_REQUIRED',
  APPROVAL_REQUIRED: 'APPROVAL_REQUIRED',
  DOCUMENT_INVALID: 'DOCUMENT_INVALID',
  DOCUMENT_PROCESSING_FAILED: 'DOCUMENT_PROCESSING_FAILED',
  MISSING_REQUIREMENT: 'MISSING_REQUIREMENT',
  LOW_CONFIDENCE: 'LOW_CONFIDENCE',
  CONFLICT_DETECTED: 'CONFLICT_DETECTED',
  KNOWLEDGE_NOT_FOUND: 'KNOWLEDGE_NOT_FOUND',
  UNSUPPORTED_ACTION: 'UNSUPPORTED_ACTION',
  PROVIDER_UNAVAILABLE: 'PROVIDER_UNAVAILABLE',
  WORKFLOW_FAILED: 'WORKFLOW_FAILED',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;
