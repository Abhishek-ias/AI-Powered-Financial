// ============================================================
// Centralized Frontend API Client
// Source of truth: Frozen Backend at VITE_API_BASE_URL (http://localhost:3000)
// ============================================================

import { ApiResponse, ReadyStatus, UserRole } from '../types';

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || 'http://localhost:3000';

export interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>;
}

// Global active session for development/demo
let activeUserId = 'user-customer-001';
let activeUserRole: UserRole = 'CUSTOMER';

export function setActiveUser(userId: string, role: UserRole = 'CUSTOMER') {
  activeUserId = userId;
  activeUserRole = role;
}

export function getActiveUser() {
  return { userId: activeUserId, role: activeUserRole };
}

export class ApiError extends Error {
  code: string;
  status: number;
  details?: unknown;

  constructor(code: string, message: string, status: number, details?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.details = details;
  }
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = new URL(`${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`);

  if (options.params) {
    Object.entries(options.params).forEach(([key, val]) => {
      if (val !== undefined) url.searchParams.append(key, String(val));
    });
  }

  const headers: Record<string, string> = {
    'X-User-Id': activeUserId,
    'X-User-Role': activeUserRole,
    'X-Request-Id': `req-fe-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...(options.headers as Record<string, string>),
  };

  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  let response: Response;
  try {
    response = await fetch(url.toString(), {
      ...options,
      headers,
    });
  } catch (networkErr: any) {
    throw new ApiError(
      'NETWORK_ERROR',
      `Cannot connect to backend server at ${API_BASE_URL}. Ensure the backend is running.`,
      0,
      networkErr
    );
  }

  // Parse JSON response
  let json: any;
  try {
    json = await response.json();
  } catch {
    json = null;
  }

  if (!response.ok) {
    const errorCode = json?.error?.code || 'HTTP_ERROR';
    const errorMessage =
      json?.error?.message ||
      (response.status === 401
        ? 'Authentication required. Please select an active demo user.'
        : response.status === 403
        ? 'Insufficient permissions for this operation.'
        : response.status === 404
        ? 'The requested resource was not found on the server.'
        : `Request failed with status ${response.status}`);

    throw new ApiError(errorCode, errorMessage, response.status, json?.error?.details);
  }

  // If backend returns enveloped ApiResponse<T>
  if (json && typeof json === 'object' && 'success' in json && 'data' in json) {
    return (json as ApiResponse<T>).data;
  }

  return json as T;
}

export const api = {
  get: <T>(endpoint: string, options?: RequestOptions) =>
    request<T>(endpoint, { ...options, method: 'GET' }),

  post: <T>(endpoint: string, body?: unknown, options?: RequestOptions) =>
    request<T>(endpoint, {
      ...options,
      method: 'POST',
      body: body instanceof FormData ? body : JSON.stringify(body || {}),
    }),

  // Health and readiness endpoints
  checkHealth: () =>
    request<{ status: string; uptime: number; version: string; project: string }>('/health'),

  checkReadiness: () => request<ReadyStatus>('/ready'),
};
