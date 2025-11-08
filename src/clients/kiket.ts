import axios, { AxiosInstance, AxiosError } from 'axios';
import https from 'https';
import {
  IssueSchema,
  Issue,
  IssueInput,
  IssueUpdate,
  IssueListFilters,
  CommentSchema,
  Comment,
  CommentInput
} from '../types/kiket.js';
import {
  errorFromStatusCode,
  NetworkError,
  KiketError
} from '../errors/index.js';
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
      httpsAgent: options.verifySSL ? undefined : new https.Agent({ rejectUnauthorized: false }),
      timeout: 30000
    });

    // Error interceptor
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data;
          const message =
            (typeof data === 'object' && data !== null && 'error' in data
              ? String(data.error)
              : error.response.statusText) || 'API request failed';

          throw errorFromStatusCode(status, message, data);
        } else if (error.request) {
          throw new NetworkError('No response from API server');
        } else {
          throw new NetworkError(error.message);
        }
      }
    );
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

  // Comments
  async listComments(issueIdOrKey: string | number): Promise<Comment[]> {
    const response = await this.client.get(`/api/v1/ext/issues/${issueIdOrKey}/comments`);
    return z.array(CommentSchema).parse(response.data.comments ?? response.data);
  }

  async createComment(issueIdOrKey: string | number, payload: CommentInput): Promise<Comment> {
    const response = await this.client.post(`/api/v1/ext/issues/${issueIdOrKey}/comments`, {
      comment: payload
    });
    return CommentSchema.parse(response.data.comment ?? response.data);
  }

  async updateComment(
    issueIdOrKey: string | number,
    commentId: number,
    payload: CommentInput
  ): Promise<Comment> {
    const response = await this.client.patch(
      `/api/v1/ext/issues/${issueIdOrKey}/comments/${commentId}`,
      { comment: payload }
    );
    return CommentSchema.parse(response.data.comment ?? response.data);
  }

  async deleteComment(issueIdOrKey: string | number, commentId: number): Promise<void> {
    await this.client.delete(`/api/v1/ext/issues/${issueIdOrKey}/comments/${commentId}`);
  }
}
