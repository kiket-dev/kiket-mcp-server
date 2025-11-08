/**
 * Custom error classes for Kiket MCP Server.
 */

/**
 * Base error for all Kiket API errors.
 */
export class KiketError extends Error {
  constructor(
    message: string,
    public readonly statusCode?: number,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Authentication error (401).
 */
export class AuthenticationError extends KiketError {
  constructor(message = 'Invalid or missing authentication credentials') {
    super(message, 401);
  }
}

/**
 * Authorization error (403).
 */
export class AuthorizationError extends KiketError {
  constructor(message = 'Insufficient permissions to perform this operation') {
    super(message, 403);
  }
}

/**
 * Resource not found error (404).
 */
export class NotFoundError extends KiketError {
  constructor(resource: string, identifier: string | number) {
    super(`${resource} not found: ${identifier}`, 404);
  }
}

/**
 * Validation error (422).
 */
export class ValidationError extends KiketError {
  constructor(
    message: string,
    public readonly errors?: Record<string, string[]>
  ) {
    super(message, 422, errors);
  }
}

/**
 * Rate limit exceeded error (429).
 */
export class RateLimitError extends KiketError {
  constructor(
    message = 'Rate limit exceeded',
    public readonly retryAfter?: number
  ) {
    super(message, 429, { retryAfter });
  }
}

/**
 * Server error (500+).
 */
export class ServerError extends KiketError {
  constructor(message = 'Internal server error occurred') {
    super(message, 500);
  }
}

/**
 * Network error (connection issues).
 */
export class NetworkError extends KiketError {
  constructor(message = 'Network request failed') {
    super(message, 0);
  }
}

/**
 * Map HTTP status codes to specific error classes.
 */
export function errorFromStatusCode(
  status: number,
  message: string,
  data?: unknown
): KiketError {
  switch (status) {
    case 401:
      return new AuthenticationError(message);
    case 403:
      return new AuthorizationError(message);
    case 404:
      return new NotFoundError('Resource', message);
    case 422:
      return new ValidationError(
        message,
        typeof data === 'object' && data !== null && 'errors' in data
          ? (data.errors as Record<string, string[]>)
          : undefined
      );
    case 429:
      return new RateLimitError(
        message,
        typeof data === 'object' && data !== null && 'retry_after' in data
          ? Number(data.retry_after)
          : undefined
      );
    default:
      if (status >= 500) {
        return new ServerError(message);
      }
      return new KiketError(message, status, data);
  }
}

/**
 * JSON-RPC error codes for MCP protocol.
 */
export const JSON_RPC_ERRORS = {
  PARSE_ERROR: -32700,
  INVALID_REQUEST: -32600,
  METHOD_NOT_FOUND: -32601,
  INVALID_PARAMS: -32602,
  INTERNAL_ERROR: -32603,
  // Custom application errors
  AUTHENTICATION_ERROR: -32001,
  AUTHORIZATION_ERROR: -32002,
  NOT_FOUND: -32003,
  VALIDATION_ERROR: -32004,
  RATE_LIMIT_ERROR: -32005,
  SERVER_ERROR: -32006
} as const;

/**
 * Map Kiket errors to JSON-RPC error codes.
 */
export function errorToJsonRpcCode(error: Error): number {
  if (error instanceof AuthenticationError) return JSON_RPC_ERRORS.AUTHENTICATION_ERROR;
  if (error instanceof AuthorizationError) return JSON_RPC_ERRORS.AUTHORIZATION_ERROR;
  if (error instanceof NotFoundError) return JSON_RPC_ERRORS.NOT_FOUND;
  if (error instanceof ValidationError) return JSON_RPC_ERRORS.VALIDATION_ERROR;
  if (error instanceof RateLimitError) return JSON_RPC_ERRORS.RATE_LIMIT_ERROR;
  if (error instanceof ServerError) return JSON_RPC_ERRORS.SERVER_ERROR;
  return JSON_RPC_ERRORS.INTERNAL_ERROR;
}
