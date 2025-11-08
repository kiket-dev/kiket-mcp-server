import { describe, it, expect } from 'vitest';
import {
  AuthenticationError,
  AuthorizationError,
  NotFoundError,
  ValidationError,
  RateLimitError,
  ServerError,
  NetworkError,
  errorFromStatusCode,
  errorToJsonRpcCode,
  JSON_RPC_ERRORS
} from '../src/errors/index.js';

describe('Error Classes', () => {
  it('should create AuthenticationError', () => {
    const error = new AuthenticationError();
    expect(error.message).toContain('authentication');
    expect(error.statusCode).toBe(401);
    expect(error.name).toBe('AuthenticationError');
  });

  it('should create AuthorizationError', () => {
    const error = new AuthorizationError();
    expect(error.message).toContain('permissions');
    expect(error.statusCode).toBe(403);
  });

  it('should create NotFoundError', () => {
    const error = new NotFoundError('Issue', '123');
    expect(error.message).toContain('Issue');
    expect(error.message).toContain('123');
    expect(error.statusCode).toBe(404);
  });

  it('should create ValidationError with details', () => {
    const errors = { title: ['is required'], description: ['is too long'] };
    const error = new ValidationError('Validation failed', errors);
    expect(error.statusCode).toBe(422);
    expect(error.details).toEqual(errors);
  });

  it('should create RateLimitError with retry info', () => {
    const error = new RateLimitError('Too many requests', 60);
    expect(error.statusCode).toBe(429);
    expect(error.retryAfter).toBe(60);
  });

  it('should create ServerError', () => {
    const error = new ServerError();
    expect(error.statusCode).toBe(500);
  });

  it('should create NetworkError', () => {
    const error = new NetworkError('Connection refused');
    expect(error.message).toContain('Connection refused');
    expect(error.statusCode).toBe(0);
  });
});

describe('errorFromStatusCode', () => {
  it('should map 401 to AuthenticationError', () => {
    const error = errorFromStatusCode(401, 'Invalid token');
    expect(error).toBeInstanceOf(AuthenticationError);
    expect(error.message).toBe('Invalid token');
  });

  it('should map 403 to AuthorizationError', () => {
    const error = errorFromStatusCode(403, 'Forbidden');
    expect(error).toBeInstanceOf(AuthorizationError);
  });

  it('should map 404 to NotFoundError', () => {
    const error = errorFromStatusCode(404, 'Not found');
    expect(error).toBeInstanceOf(NotFoundError);
  });

  it('should map 422 to ValidationError', () => {
    const data = { errors: { title: ['required'] } };
    const error = errorFromStatusCode(422, 'Invalid', data);
    expect(error).toBeInstanceOf(ValidationError);
    expect((error as ValidationError).errors).toEqual(data.errors);
  });

  it('should map 429 to RateLimitError', () => {
    const error = errorFromStatusCode(429, 'Rate limit', { retry_after: 30 });
    expect(error).toBeInstanceOf(RateLimitError);
    expect((error as RateLimitError).retryAfter).toBe(30);
  });

  it('should map 500+ to ServerError', () => {
    const error = errorFromStatusCode(503, 'Service unavailable');
    expect(error).toBeInstanceOf(ServerError);
  });
});

describe('errorToJsonRpcCode', () => {
  it('should map AuthenticationError to JSON-RPC code', () => {
    const error = new AuthenticationError();
    expect(errorToJsonRpcCode(error)).toBe(JSON_RPC_ERRORS.AUTHENTICATION_ERROR);
  });

  it('should map NotFoundError to JSON-RPC code', () => {
    const error = new NotFoundError('Issue', '123');
    expect(errorToJsonRpcCode(error)).toBe(JSON_RPC_ERRORS.NOT_FOUND);
  });

  it('should map ValidationError to JSON-RPC code', () => {
    const error = new ValidationError('Invalid');
    expect(errorToJsonRpcCode(error)).toBe(JSON_RPC_ERRORS.VALIDATION_ERROR);
  });

  it('should map RateLimitError to JSON-RPC code', () => {
    const error = new RateLimitError();
    expect(errorToJsonRpcCode(error)).toBe(JSON_RPC_ERRORS.RATE_LIMIT_ERROR);
  });

  it('should map ServerError to JSON-RPC code', () => {
    const error = new ServerError();
    expect(errorToJsonRpcCode(error)).toBe(JSON_RPC_ERRORS.SERVER_ERROR);
  });

  it('should map unknown error to INTERNAL_ERROR', () => {
    const error = new Error('Unknown');
    expect(errorToJsonRpcCode(error)).toBe(JSON_RPC_ERRORS.INTERNAL_ERROR);
  });
});
