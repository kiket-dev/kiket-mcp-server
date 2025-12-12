import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '../../.env');

// Load .env file from mcp-server directory (won't override existing env vars)
dotenv.config({ path: envPath });

interface EnvConfig {
  apiUrl: string;
  apiKey: string;
  projectKey?: string;
  verifySSL: boolean;
}

export function loadEnv(): EnvConfig {
  const apiUrl = process.env.KIKET_API_URL;
  const apiKey = process.env.KIKET_API_KEY;
  const projectKey = process.env.KIKET_PROJECT_KEY;
  const verifySSL = process.env.KIKET_VERIFY_SSL !== 'false';

  if (!apiUrl) {
    throw new Error('KIKET_API_URL is required');
  }

  if (!apiKey) {
    throw new Error('KIKET_API_KEY is required');
  }

  return { apiUrl, apiKey, projectKey, verifySSL };
}
