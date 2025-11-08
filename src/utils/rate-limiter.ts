import { log } from './logger.js';

export interface RateLimiterConfig {
  maxRetries: number;
  baseDelayMs: number;
  maxDelayMs: number;
}

const DEFAULT_CONFIG: RateLimiterConfig = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 30000
};

/**
 * Rate limiter with exponential backoff for API requests
 */
export class RateLimiter {
  private config: RateLimiterConfig;

  constructor(config: Partial<RateLimiterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Execute a function with exponential backoff retry logic
   */
  async executeWithBackoff<T>(
    fn: () => Promise<T>,
    context: string = 'API request'
  ): Promise<T> {
    let lastError: Error | undefined;

    for (let attempt = 0; attempt <= this.config.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error as Error;

        // Check if this is a rate limit error (429)
        const isRateLimitError =
          error &&
          typeof error === 'object' &&
          'statusCode' in error &&
          (error as { statusCode: number }).statusCode === 429;

        // Check if this is a retriable error
        const isRetriable = isRateLimitError || this.isRetriableError(error as Error);

        if (!isRetriable || attempt === this.config.maxRetries) {
          log.error(`${context} failed after ${attempt + 1} attempts`, {
            error: (error as Error).message,
            attempts: attempt + 1
          });
          throw error;
        }

        // Calculate delay with exponential backoff
        const delay = this.calculateDelay(attempt, Boolean(isRateLimitError), error);

        log.warn(`${context} failed, retrying in ${delay}ms`, {
          attempt: attempt + 1,
          maxRetries: this.config.maxRetries,
          error: (error as Error).message
        });

        await this.sleep(delay);
      }
    }

    throw lastError;
  }

  private calculateDelay(attempt: number, isRateLimitError: boolean, error: unknown): number {
    // If server provided a Retry-After header or retryAfter field, use it
    if (isRateLimitError && error && typeof error === 'object' && 'retryAfter' in error) {
      const retryAfter = (error as { retryAfter: unknown }).retryAfter;
      if (typeof retryAfter === 'number') {
        return Math.min(retryAfter * 1000, this.config.maxDelayMs);
      }
    }

    // Otherwise use exponential backoff: baseDelay * 2^attempt
    const exponentialDelay = this.config.baseDelayMs * Math.pow(2, attempt);

    // Add jitter (random 0-25% of delay) to prevent thundering herd
    const jitter = exponentialDelay * 0.25 * Math.random();

    return Math.min(exponentialDelay + jitter, this.config.maxDelayMs);
  }

  private isRetriableError(error: Error | unknown): boolean {
    // Retry on network errors, 5xx server errors, and 429 rate limits
    if (error && typeof error === 'object' && 'statusCode' in error) {
      const statusCode = (error as { statusCode: number }).statusCode;
      return statusCode === 429 || (statusCode >= 500 && statusCode < 600);
    }

    // Retry on network timeouts and connection errors
    if (error instanceof Error) {
      const message = error.message.toLowerCase();
      return (
        message.includes('timeout') ||
        message.includes('econnreset') ||
        message.includes('enotfound') ||
        message.includes('econnrefused')
      );
    }

    return false;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const rateLimiter = new RateLimiter();
