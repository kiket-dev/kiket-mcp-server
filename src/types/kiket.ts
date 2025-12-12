import { z } from 'zod';

export const IssueSchema = z.object({
  id: z.number(),
  key: z.string().nullish(),
  title: z.string(),
  description: z.string().nullish(),
  status: z.string(),
  workflow_state: z.string().nullish(),
  assignee: z
    .object({
      id: z.number(),
      name: z.string().nullish(),
      email: z.string().nullish()
    })
    .nullish(),
  priority: z.string().nullish(),
  labels: z.array(z.string()).nullish().default([]),
  issue_type: z.string().nullish(),
  /** Parent issue ID for hierarchy (Epic -> UserStory -> Task) */
  parent_id: z.number().nullish(),
  /** Parent issue key for display purposes */
  parent_key: z.string().nullish(),
  created_at: z.string(),
  updated_at: z.string()
});

export type Issue = z.infer<typeof IssueSchema>;

/**
 * Valid priority values for issues.
 * Must be lowercase.
 */
export const ISSUE_PRIORITIES = ['low', 'medium', 'high', 'critical'] as const;
export type IssuePriority = (typeof ISSUE_PRIORITIES)[number];

/**
 * Common issue types (organization-specific types may vary).
 * Typically PascalCase: Epic, UserStory, Task, Bug
 */
export const DEFAULT_ISSUE_TYPES = ['Epic', 'UserStory', 'Task', 'Bug'] as const;
export type DefaultIssueType = (typeof DEFAULT_ISSUE_TYPES)[number];

/**
 * Default values applied when creating issues.
 */
export const ISSUE_DEFAULTS = {
  status: 'backlog',
  issue_type: 'Task'
} as const;

export const IssueInputSchema = z.object({
  project_key: z.string().optional(),
  project_id: z.number().optional(),
  title: z.string(),
  description: z.string().optional(),
  /** Status of the issue. Defaults to 'backlog' if not provided. */
  status: z.string().optional(),
  /** Issue type (e.g., Epic, UserStory, Task, Bug). Defaults to 'Task' if not provided. */
  issue_type: z.string().optional(),
  /** Priority: low, medium, high, or critical (lowercase). */
  priority: z.enum(ISSUE_PRIORITIES).optional(),
  assignee_id: z.number().optional(),
  labels: z.array(z.string()).optional(),
  /**
   * Parent issue ID for hierarchy. Use for linking:
   * - UserStory to Epic
   * - Task/Bug to UserStory or Epic
   * Parent must have allow_children=true in its issue type definition.
   */
  parent_id: z.number().optional(),
  /**
   * Custom fields as key-value pairs.
   * Field keys and valid values are project/org specific.
   * Use the project's field definitions to determine valid keys and values.
   */
  custom_fields: z.record(z.string(), z.unknown()).optional()
});

export type IssueInput = z.infer<typeof IssueInputSchema>;

export const IssueUpdateSchema = IssueInputSchema.partial();
export type IssueUpdate = z.infer<typeof IssueUpdateSchema>;

export const IssueListFiltersSchema = z.object({
  project_key: z.string().optional(),
  status: z.string().optional(),
  assignee_id: z.number().optional(),
  label: z.string().optional(),
  search: z.string().optional(),
  page: z.number().optional(),
  per_page: z.number().optional()
});

export type IssueListFilters = z.infer<typeof IssueListFiltersSchema>;

// Comments
export const CommentSchema = z.object({
  id: z.number(),
  body: z.string(),
  author: z.object({
    id: z.number(),
    name: z.string().nullable(),
    email: z.string().nullable()
  }),
  created_at: z.string(),
  updated_at: z.string()
});

export type Comment = z.infer<typeof CommentSchema>;

export const CommentInputSchema = z.object({
  body: z.string().min(1)
});

export type CommentInput = z.infer<typeof CommentInputSchema>;

// Projects
export const ProjectSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullish(),
  organization_id: z.number(),
  project_key: z.string().nullish(),
  status: z.string().nullish(),
  visibility: z.string().nullish(),
  github_repo_url: z.string().nullish(),
  start_date: z.string().nullish(),
  end_date: z.string().nullish(),
  workflow_sync_enabled: z.boolean().nullish(),
  workflow_auto_boards: z.boolean().nullish(),
  settings: z.record(z.any()).nullish(),
  lead_id: z.number().nullish(),
  created_at: z.string(),
  updated_at: z.string()
});

export type Project = z.infer<typeof ProjectSchema>;

export const ProjectInputSchema = z.object({
  name: z.string().min(2).max(100),
  description: z.string().max(1000).optional(),
  project_key: z.string().regex(/^[A-Z][A-Z0-9]*$/),
  github_repo_url: z.string().url().optional(),
  visibility: z.enum(['private', 'team', 'public']).optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  lead_id: z.number().optional()
});

export type ProjectInput = z.infer<typeof ProjectInputSchema>;

export const ProjectUpdateSchema = ProjectInputSchema.partial();
export type ProjectUpdate = z.infer<typeof ProjectUpdateSchema>;

export const ProjectListFiltersSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional()
});

export type ProjectListFilters = z.infer<typeof ProjectListFiltersSchema>;

// Issue Schema (types, custom fields, statuses)
export const IssueTypeSchema = z.object({
  key: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  color: z.string().optional(),
  allow_children: z.boolean().optional(),
  description: z.string().nullish()
});

export type IssueType = z.infer<typeof IssueTypeSchema>;

export const CustomFieldSchema = z.object({
  key: z.string(),
  label: z.string(),
  type: z.enum(['string', 'text', 'number', 'boolean', 'enum']),
  required: z.boolean().optional(),
  issue_type: z.string().nullish(),
  options: z.array(z.string()).nullish(),
  default_value: z.unknown().nullish(),
  helper_text: z.string().nullish()
});

export type CustomField = z.infer<typeof CustomFieldSchema>;

export const StatusSchema = z.object({
  key: z.string(),
  label: z.string(),
  category: z.string().optional()
});

export type Status = z.infer<typeof StatusSchema>;

export const IssueSchemaResponseSchema = z.object({
  issue_types: z.array(IssueTypeSchema),
  custom_fields: z.array(CustomFieldSchema),
  priorities: z.array(z.string()),
  statuses: z.array(StatusSchema)
});

export type IssueSchemaResponse = z.infer<typeof IssueSchemaResponseSchema>;

// Users
export const UserSchema = z.object({
  id: z.number(),
  name: z.string().nullish(),
  email: z.string(),
  role: z.string().nullish(),
  organization_id: z.number().nullish(),
  expertise_tags: z.array(z.string()).nullish(),
  historical_velocity: z.number().nullish(),
  avatar_url: z.string().nullish(),
  capacity: z.number().nullish(),
  super_admin: z.boolean().nullish(),
  deactivated: z.boolean().nullish(),
  created_at: z.string().optional(),
  updated_at: z.string().optional()
});

export type User = z.infer<typeof UserSchema>;

export const UserListFiltersSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional(),
  role: z.string().optional()
});

export type UserListFilters = z.infer<typeof UserListFiltersSchema>;
