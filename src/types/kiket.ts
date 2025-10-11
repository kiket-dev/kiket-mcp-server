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
