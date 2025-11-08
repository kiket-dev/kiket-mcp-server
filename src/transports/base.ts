/**
 * Base transport interface for MCP server.
 */

export type MessageHandler = (message: Record<string, unknown>) => Promise<Record<string, unknown> | undefined>;

export interface Transport {
  /**
   * Start the transport and begin listening for messages.
   */
  start(handler: MessageHandler): Promise<void>;

  /**
   * Stop the transport and clean up resources.
   */
  stop(): Promise<void>;

  /**
   * Send a message through the transport.
   */
  send(message: Record<string, unknown> | undefined): void;
}
