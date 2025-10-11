import axios, { AxiosInstance } from 'axios';
import https from 'https';
import {
  IssueSchema,
  Issue,
  IssueInput,
  IssueUpdate,
  IssueListFilters
} from '../types/kiket.js';
import { z } from 'zod';

const IssueListResponseSchema = z.object({
  issues: z.array(IssueSchema),
  pagination: z
    .object({
      page: z.number(),
      per_page: z.number(),
      total_pages: z.number(),
      total_count: z.number()
    })
    .optional()
});

export class KiketClient {
  private client: AxiosInstance;

  constructor(options: { baseUrl: string; apiKey: string; verifySSL: boolean }) {
    this.client = axios.create({
      baseURL: options.baseUrl,
      headers: {
        Authorization: `Bearer ${options.apiKey}`,
        'Content-Type': 'application/json'
      },
      httpsAgent: options.verifySSL ? undefined : new https.Agent({ rejectUnauthorized: false })
    });
  }

  async listIssues(filters: IssueListFilters = {}): Promise<Issue[]> {
    const response = await this.client.get('/api/v1/ext/issues', { params: filters });
    return IssueListResponseSchema.parse(response.data).issues;
  }

  async getIssue(idOrKey: string | number): Promise<Issue> {
    const response = await this.client.get(`/api/v1/ext/issues/${idOrKey}`);
    return IssueSchema.parse(response.data.issue ?? response.data);
  }

  async createIssue(payload: IssueInput): Promise<Issue> {
    const response = await this.client.post('/api/v1/ext/issues', { issue: payload });
    return IssueSchema.parse(response.data.issue ?? response.data);
  }

  async updateIssue(idOrKey: string | number, payload: IssueUpdate): Promise<Issue> {
    const response = await this.client.patch(`/api/v1/ext/issues/${idOrKey}`, { issue: payload });
    return IssueSchema.parse(response.data.issue ?? response.data);
  }

  async transitionIssue(idOrKey: string | number, transition: string): Promise<Issue> {
    const response = await this.client.post(`/api/v1/ext/issues/${idOrKey}/transitions`, {
      transition
    });
    return IssueSchema.parse(response.data.issue ?? response.data);
  }
}
