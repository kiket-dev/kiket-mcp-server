import axios, { AxiosInstance, AxiosError } from 'axios';
import https from 'https';
import {
  IssueSchema,
  Issue,
  IssueInput,
  IssueUpdate,
  IssueListFilters,
  ISSUE_DEFAULTS,
  IssueSchemaResponseSchema,
  IssueSchemaResponse,
  CommentSchema,
  Comment,
  CommentInput,
  ProjectSchema,
  Project,
  ProjectInput,
  ProjectUpdate,
  ProjectListFilters,
  UserSchema,
  User,
  UserListFilters
} from '../types/kiket.js';
import {
  errorFromStatusCode,
  NetworkError
} from '../errors/index.js';
import { rateLimiter } from '../utils/rate-limiter.js';
import { z } from 'zod';

const IssueListResponseSchema = z.union([
  z.object({
    issues: z.array(IssueSchema),
    pagination: z
      .object({
        page: z.number(),
        per_page: z.number(),
        total_pages: z.number(),
        total_count: z.number()
      })
      .optional()
  }),
  z.object({
    data: z.array(IssueSchema),
    meta: z
      .object({
        current_page: z.number(),
        per_page: z.number().optional(),
        total_pages: z.number(),
        total_count: z.number()
      })
      .optional()
  })
]);

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

    // Error interceptor with detailed validation error messages
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response) {
          const status = error.response.status;
          const data = error.response.data as Record<string, unknown> | undefined;

          // Build detailed error message for validation errors
          let message: string;
          if (status === 422 && data) {
            const parts: string[] = [];

            // Handle 'error' field (string message)
            if (typeof data.error === 'string') {
              parts.push(data.error);
            }

            // Handle 'errors' field (array of validation messages)
            if (Array.isArray(data.errors)) {
              parts.push(...data.errors.map(String));
            } else if (typeof data.errors === 'object' && data.errors !== null) {
              // Handle errors as object { field: [messages] }
              for (const [field, messages] of Object.entries(data.errors)) {
                if (Array.isArray(messages)) {
                  parts.push(`${field}: ${messages.join(', ')}`);
                }
              }
            }

            message = parts.length > 0 ? parts.join('; ') : 'Validation failed';
          } else {
            message =
              (typeof data === 'object' && data !== null && 'error' in data
                ? String(data.error)
                : error.response.statusText) || 'API request failed';
          }

          throw errorFromStatusCode(status, message, data);
        } else if (error.request) {
          throw new NetworkError('No response from API server');
        } else {
          throw new NetworkError(error.message);
        }
      }
    );
  }

  /**
   * Helper to execute requests with rate limiting
   */
  private async withRateLimit<T>(fn: () => Promise<T>, context: string): Promise<T> {
    return rateLimiter.executeWithBackoff(fn, context);
  }

  async listIssues(filters: IssueListFilters = {}): Promise<Issue[]> {
    return this.withRateLimit(async () => {
      const response = await this.client.get('/api/v1/issues', { params: filters });
      const parsed = IssueListResponseSchema.parse(response.data);
      return 'issues' in parsed ? parsed.issues : parsed.data;
    }, 'List issues');
  }

  async getIssue(idOrKey: string | number): Promise<Issue> {
    return this.withRateLimit(async () => {
      const response = await this.client.get(`/api/v1/issues/${idOrKey}`);
      return IssueSchema.parse(response.data.issue ?? response.data);
    }, 'Get issue');
  }

  async createIssue(payload: IssueInput): Promise<Issue> {
    return this.withRateLimit(async () => {
      // Apply defaults for required fields if not provided
      const issueData: IssueInput = {
        ...payload,
        status: payload.status ?? ISSUE_DEFAULTS.status,
        issue_type: payload.issue_type ?? ISSUE_DEFAULTS.issue_type
      };

      const response = await this.client.post('/api/v1/issues', {
        project_key: payload.project_key,
        project_id: payload.project_id,
        issue: issueData
      });
      return IssueSchema.parse(response.data.issue ?? response.data);
    }, 'Create issue');
  }

  async updateIssue(idOrKey: string | number, payload: IssueUpdate): Promise<Issue> {
    return this.withRateLimit(async () => {
      const response = await this.client.patch(`/api/v1/issues/${idOrKey}`, { issue: payload });
      return IssueSchema.parse(response.data.issue ?? response.data);
    }, 'Update issue');
  }

  async transitionIssue(idOrKey: string | number, transition: string): Promise<Issue> {
    return this.withRateLimit(async () => {
      const response = await this.client.post(`/api/v1/issues/${idOrKey}/transition`, {
        transition: { state: transition }
      });
      return IssueSchema.parse(response.data.issue ?? response.data);
    }, 'Transition issue');
  }

  // Comments
  async listComments(issueIdOrKey: string | number): Promise<Comment[]> {
    return this.withRateLimit(async () => {
      const response = await this.client.get(`/api/v1/issues/${issueIdOrKey}/comments`);
      return z.array(CommentSchema).parse(response.data.comments ?? response.data);
    }, 'List comments');
  }

  async createComment(issueIdOrKey: string | number, payload: CommentInput): Promise<Comment> {
    return this.withRateLimit(async () => {
      const response = await this.client.post(`/api/v1/issues/${issueIdOrKey}/comments`, {
        comment: payload
      });
      return CommentSchema.parse(response.data.comment ?? response.data);
    }, 'Create comment');
  }

  async updateComment(
    issueIdOrKey: string | number,
    commentId: number,
    payload: CommentInput
  ): Promise<Comment> {
    return this.withRateLimit(async () => {
      const response = await this.client.patch(`/api/v1/issues/${issueIdOrKey}/comments/${commentId}`, {
        comment: payload
      });
      return CommentSchema.parse(response.data.comment ?? response.data);
    }, 'Update comment');
  }

  async deleteComment(issueIdOrKey: string | number, commentId: number): Promise<void> {
    return this.withRateLimit(async () => {
      await this.client.delete(`/api/v1/issues/${issueIdOrKey}/comments/${commentId}`);
    }, 'Delete comment');
  }

  // Projects
  async listProjects(filters: ProjectListFilters = {}): Promise<Project[]> {
    return this.withRateLimit(async () => {
      const response = await this.client.get('/api/v1/projects', { params: filters });
      // API returns {data: [...], meta: {...}} or {projects: [...]}
      return z.array(ProjectSchema).parse(response.data.projects ?? response.data.data ?? response.data);
    }, 'List projects');
  }

  async getProject(id: number): Promise<Project> {
    return this.withRateLimit(async () => {
      const response = await this.client.get(`/api/v1/projects/${id}`);
      return ProjectSchema.parse(response.data.project ?? response.data);
    }, 'Get project');
  }

  async getProjectByKey(key: string): Promise<Project> {
    return this.withRateLimit(async () => {
      const projects = await this.listProjects();
      const project = projects.find(p => p.project_key === key);
      if (!project) {
        throw new Error(`Project not found: ${key}`);
      }
      return project;
    }, 'Get project by key');
  }

  async createProject(payload: ProjectInput): Promise<Project> {
    return this.withRateLimit(async () => {
      const response = await this.client.post('/api/v1/projects', { project: payload });
      return ProjectSchema.parse(response.data.project ?? response.data);
    }, 'Create project');
  }

  async updateProject(id: number, payload: ProjectUpdate): Promise<Project> {
    return this.withRateLimit(async () => {
      const response = await this.client.patch(`/api/v1/projects/${id}`, { project: payload });
      return ProjectSchema.parse(response.data.project ?? response.data);
    }, 'Update project');
  }

  async deleteProject(id: number): Promise<void> {
    return this.withRateLimit(async () => {
      await this.client.delete(`/api/v1/projects/${id}`);
    }, 'Delete project');
  }

  // Users
  async listUsers(filters: UserListFilters = {}): Promise<User[]> {
    return this.withRateLimit(async () => {
      const response = await this.client.get('/api/v1/users', { params: filters });
      return z.array(UserSchema).parse(response.data.users ?? response.data);
    }, 'List users');
  }

  async getUser(id: number): Promise<User> {
    return this.withRateLimit(async () => {
      const response = await this.client.get(`/api/v1/users/${id}`);
      return UserSchema.parse(response.data.user ?? response.data);
    }, 'Get user');
  }

  async getCurrentUser(): Promise<User> {
    return this.withRateLimit(async () => {
      const response = await this.client.get('/api/v1/me');
      return UserSchema.parse(response.data.user ?? response.data);
    }, 'Get current user');
  }

  // Issue Schema
  /**
   * Get issue schema (types, custom fields, statuses) for the organization.
   * If projectIdOrKey is provided, includes project-specific custom fields.
   */
  async getIssueSchema(projectIdOrKey?: string | number): Promise<IssueSchemaResponse> {
    return this.withRateLimit(async () => {
      const url = projectIdOrKey
        ? `/api/v1/projects/${projectIdOrKey}/issue_schema`
        : '/api/v1/issue_schema';
      const response = await this.client.get(url);
      return IssueSchemaResponseSchema.parse(response.data);
    }, 'Get issue schema');
  }
}
