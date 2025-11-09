import winston from 'winston';

const logLevel = process.env.LOG_LEVEL || 'info';
const nodeEnv = process.env.NODE_ENV || 'development';
const mcpTransport = process.env.MCP_TRANSPORT || 'websocket';

// Custom format for development (colorized, pretty)
const devFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
    return `${timestamp} ${level}: ${message}${metaStr}`;
  })
);

// Custom format for production (JSON, structured)
const prodFormat = winston.format.combine(
  winston.format.timestamp(),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Disable logging entirely in stdio mode to avoid any interference with MCP protocol
const transports = mcpTransport === 'stdio' ? [] : [
  new winston.transports.Console({
    // Send ALL logs to stderr to avoid interfering with stdio MCP protocol
    // (stdout must only contain JSON-RPC messages)
    stderrLevels: ['error', 'warn', 'info', 'debug']
  })
];

export const logger = winston.createLogger({
  level: logLevel,
  format: nodeEnv === 'production' ? prodFormat : devFormat,
  transports,
  // Don't exit on uncaught errors
  exitOnError: false,
  // Silence logger completely in stdio mode
  silent: mcpTransport === 'stdio'
});

// Request context logger
export interface RequestContext {
  requestId?: string;
  method?: string;
  toolName?: string;
  userId?: string;
  duration?: number;
  error?: string;
  params?: Record<string, unknown>;
  [key: string]: unknown; // Allow additional properties
}

export function logRequest(level: string, message: string, context: RequestContext = {}) {
  logger.log(level, message, context);
}

// Convenience methods
export const log = {
  info: (message: string, meta?: Record<string, unknown>) => logger.info(message, meta),
  warn: (message: string, meta?: Record<string, unknown>) => logger.warn(message, meta),
  error: (message: string, meta?: Record<string, unknown>) => logger.error(message, meta),
  debug: (message: string, meta?: Record<string, unknown>) => logger.debug(message, meta),

  // Request-specific logging
  request: (message: string, context: RequestContext) =>
    logRequest('info', message, context),

  requestError: (message: string, context: RequestContext) =>
    logRequest('error', message, context)
};
