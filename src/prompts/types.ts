/**
 * MCP Prompt type definitions
 */

import { z } from 'zod';

export const PromptArgumentSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  required: z.boolean().optional()
});

export type PromptArgument = z.infer<typeof PromptArgumentSchema>;

export const PromptDefinitionSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  arguments: z.array(PromptArgumentSchema).optional()
});

export type PromptDefinition = z.infer<typeof PromptDefinitionSchema>;

export const PromptMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.object({
    type: z.literal('text'),
    text: z.string()
  })
});

export type PromptMessage = z.infer<typeof PromptMessageSchema>;

export const GetPromptResultSchema = z.object({
  description: z.string().optional(),
  messages: z.array(PromptMessageSchema)
});

export type GetPromptResult = z.infer<typeof GetPromptResultSchema>;
