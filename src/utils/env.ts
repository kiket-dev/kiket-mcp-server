import dotenv from 'dotenv';

dotenv.config();

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
