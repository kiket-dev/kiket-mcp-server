import { z } from 'zod';

export const IssueSchema = z.object({
  id: z.number(),
  key: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  status: z.string(),
  workflow_state: z.string().optional(),
  assignee: z
    .object({
      id: z.number(),
      name: z.string().nullable(),
      email: z.string().nullable()
    })
    .nullable(),
  priority: z.string().nullable(),
  labels: z.array(z.string()).optional().default([]),
  issue_type: z.string().optional(),
  created_at: z.string(),
  updated_at: z.string()
});

export type Issue = z.infer<typeof IssueSchema>;

export const IssueInputSchema = z.object({
  project_key: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  issue_type: z.string().optional(),
  priority: z.string().optional(),
  assignee_id: z.number().optional(),
  labels: z.array(z.string()).optional()
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
  description: z.string().nullable(),
  organization_id: z.number(),
  project_key: z.string(),
  status: z.string().nullable(),
  visibility: z.string().nullable(),
  github_repo_url: z.string().nullable(),
  start_date: z.string().nullable(),
  end_date: z.string().nullable(),
  workflow_sync_enabled: z.boolean().nullable(),
  workflow_auto_boards: z.boolean().nullable(),
  settings: z.record(z.any()).nullable(),
  lead_id: z.number().nullable(),
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

// Users
export const UserSchema = z.object({
  id: z.number(),
  name: z.string(),
  email: z.string(),
  role: z.string().nullable(),
  organization_id: z.number().nullable(),
  expertise_tags: z.array(z.string()).nullable(),
  historical_velocity: z.number().nullable(),
  avatar_url: z.string().nullable(),
  capacity: z.number().nullable(),
  super_admin: z.boolean().nullable(),
  deactivated: z.boolean().nullable(),
  created_at: z.string(),
  updated_at: z.string()
});

export type User = z.infer<typeof UserSchema>;

export const UserListFiltersSchema = z.object({
  page: z.number().optional(),
  per_page: z.number().optional()
});

export type UserListFilters = z.infer<typeof UserListFiltersSchema>;
