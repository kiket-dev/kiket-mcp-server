/**
 * Health check HTTP server for monitoring and readiness probes.
 */

import express from 'express';
import { KiketClient } from './clients/kiket.js';

export class HealthServer {
  private app = express();
  private server?: ReturnType<typeof this.app.listen>;

  constructor(
    private port: number,
    private kiketClient: KiketClient
  ) {
    this.setupRoutes();
  }

  private setupRoutes() {
    // Liveness probe - is the server running?
    this.app.get('/health', (_req, res) => {
      res.status(200).json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
      });
    });

    // Readiness probe - is the server ready to accept requests?
    this.app.get('/ready', async (_req, res) => {
      try {
        // Check if we can reach the Kiket API
        await this.checkKiketAPI();

        res.status(200).json({
          ready: true,
          timestamp: new Date().toISOString()
        });
      } catch (error) {
        res.status(503).json({
          ready: false,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    });

    // Detailed health check
    this.app.get('/health/details', async (_req, res) => {
      const checks = {
        api: await this.checkKiketAPI()
      };

      const healthy = Object.values(checks).every((c) => c.healthy);

      res.status(healthy ? 200 : 503).json({
        status: healthy ? 'healthy' : 'unhealthy',
        timestamp: new Date().toISOString(),
        checks
      });
    });
  }

  private async checkKiketAPI(): Promise<{ healthy: boolean; latency?: number; error?: string }> {
    try {
      const start = Date.now();
      // Try to list issues (minimal API call)
      await this.kiketClient.listIssues({ per_page: 1 });
      const latency = Date.now() - start;

      return { healthy: true, latency };
    } catch (error) {
      return {
        healthy: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  start(): void {
    this.server = this.app.listen(this.port, () => {
      console.log(`Health check server listening on http://localhost:${this.port}`);
    });
  }

  async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.server) {
        this.server.close((err) => {
          if (err) reject(err);
          else resolve();
        });
      } else {
        resolve();
      }
    });
  }
}
