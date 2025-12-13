import { describe, it, expect } from 'vitest';
import { PromptsHandler } from './index.js';

describe('PromptsHandler', () => {
  const handler = new PromptsHandler();

  describe('listPrompts', () => {
    it('returns all prompt definitions', () => {
      const prompts = handler.listPrompts();

      expect(Array.isArray(prompts)).toBe(true);
      expect(prompts.length).toBeGreaterThan(0);
    });

    it('each prompt has required fields', () => {
      const prompts = handler.listPrompts();

      prompts.forEach(prompt => {
        expect(prompt).toHaveProperty('name');
        expect(typeof prompt.name).toBe('string');
        expect(prompt.name.length).toBeGreaterThan(0);
      });
    });

    it('includes issue management prompts', () => {
      const prompts = handler.listPrompts();
      const promptNames = prompts.map(p => p.name);

      expect(promptNames).toContain('create-issue');
      expect(promptNames).toContain('create-bug-report');
      expect(promptNames).toContain('create-feature');
      expect(promptNames).toContain('update-issue');
      expect(promptNames).toContain('bulk-update-issues');
      expect(promptNames).toContain('close-issue');
      expect(promptNames).toContain('delete-issue');
    });

    it('includes milestone management prompts', () => {
      const prompts = handler.listPrompts();
      const promptNames = prompts.map(p => p.name);

      expect(promptNames).toContain('create-milestone');
      expect(promptNames).toContain('plan-sprint');
      expect(promptNames).toContain('update-milestone');
      expect(promptNames).toContain('close-milestone');
      expect(promptNames).toContain('delete-milestone');
    });

    it('includes analysis prompts', () => {
      const prompts = handler.listPrompts();
      const promptNames = prompts.map(p => p.name);

      expect(promptNames).toContain('daily-standup');
      expect(promptNames).toContain('release-notes');
      expect(promptNames).toContain('backlog-review');
      expect(promptNames).toContain('project-overview');
    });

    it('prompts have descriptions', () => {
      const prompts = handler.listPrompts();

      prompts.forEach(prompt => {
        expect(prompt.description).toBeDefined();
        expect(typeof prompt.description).toBe('string');
      });
    });

    it('prompts with arguments have properly structured arguments', () => {
      const prompts = handler.listPrompts();

      prompts.forEach(prompt => {
        if (prompt.arguments) {
          expect(Array.isArray(prompt.arguments)).toBe(true);
          prompt.arguments.forEach(arg => {
            expect(arg).toHaveProperty('name');
            expect(typeof arg.name).toBe('string');
          });
        }
      });
    });
  });

  describe('getPrompt', () => {
    it('returns null for unknown prompt', () => {
      const result = handler.getPrompt('unknown-prompt', {});
      expect(result).toBeNull();
    });

    describe('create-issue prompt', () => {
      it('generates prompt with required title', () => {
        const result = handler.getPrompt('create-issue', { title: 'Test Issue' });

        expect(result).not.toBeNull();
        expect(result?.messages).toHaveLength(1);
        expect(result?.messages[0].role).toBe('user');
        expect(result?.messages[0].content.type).toBe('text');
        expect(result?.messages[0].content.text).toContain('Test Issue');
      });

      it('includes type when provided', () => {
        const result = handler.getPrompt('create-issue', {
          title: 'Test Bug',
          type: 'Bug'
        });

        expect(result?.messages[0].content.text).toContain('Bug');
      });

      it('includes priority when provided', () => {
        const result = handler.getPrompt('create-issue', {
          title: 'Critical Issue',
          priority: 'critical'
        });

        expect(result?.messages[0].content.text).toContain('critical');
      });
    });

    describe('create-bug-report prompt', () => {
      it('generates bug report prompt', () => {
        const result = handler.getPrompt('create-bug-report', {
          title: 'Button not working'
        });

        expect(result).not.toBeNull();
        expect(result?.description).toContain('bug report');
      });

      it('includes steps when provided', () => {
        const result = handler.getPrompt('create-bug-report', {
          title: 'Button broken',
          steps: '1. Click button\n2. Nothing happens'
        });

        expect(result?.messages[0].content.text).toContain('Steps to Reproduce');
        expect(result?.messages[0].content.text).toContain('Click button');
      });
    });

    describe('create-feature prompt', () => {
      it('generates feature prompt', () => {
        const result = handler.getPrompt('create-feature', {
          title: 'Dark mode support'
        });

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('Dark mode support');
      });

      it('prompts for breakdown when requested', () => {
        const result = handler.getPrompt('create-feature', {
          title: 'New dashboard',
          breakdown: 'true'
        });

        expect(result?.messages[0].content.text).toContain('Break it down');
        expect(result?.messages[0].content.text).toContain('Tasks');
      });
    });

    describe('update-issue prompt', () => {
      it('generates update prompt with issue ID', () => {
        const result = handler.getPrompt('update-issue', { issue_id: 'PROJ-123' });

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('PROJ-123');
        expect(result?.messages[0].content.text).toContain('getIssue');
      });

      it('includes changes when provided', () => {
        const result = handler.getPrompt('update-issue', {
          issue_id: 'PROJ-123',
          changes: 'change priority to high'
        });

        expect(result?.messages[0].content.text).toContain('change priority to high');
      });
    });

    describe('bulk-update-issues prompt', () => {
      it('generates bulk update prompt', () => {
        const result = handler.getPrompt('bulk-update-issues', {
          filter: 'all bugs in backlog',
          action: 'set priority high'
        });

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('all bugs in backlog');
        expect(result?.messages[0].content.text).toContain('set priority high');
        expect(result?.messages[0].content.text).toContain('confirmation');
      });
    });

    describe('close-issue prompt', () => {
      it('generates close prompt', () => {
        const result = handler.getPrompt('close-issue', { issue_id: 'PROJ-456' });

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('PROJ-456');
        expect(result?.messages[0].content.text).toContain('transitionIssue');
      });
    });

    describe('delete-issue prompt', () => {
      it('includes warning about permanent deletion', () => {
        const result = handler.getPrompt('delete-issue', { issue_id: 'PROJ-789' });

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('WARNING');
        expect(result?.messages[0].content.text).toContain('permanent');
        expect(result?.messages[0].content.text).toContain('confirmation');
      });
    });

    describe('create-milestone prompt', () => {
      it('generates milestone creation prompt', () => {
        const result = handler.getPrompt('create-milestone', {
          title: 'Sprint 42'
        });

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('Sprint 42');
        expect(result?.messages[0].content.text).toContain('createMilestone');
      });

      it('includes dates when provided', () => {
        const result = handler.getPrompt('create-milestone', {
          title: 'Release 2.0',
          start_date: '2025-01-01',
          due_date: '2025-01-15'
        });

        expect(result?.messages[0].content.text).toContain('2025-01-01');
        expect(result?.messages[0].content.text).toContain('2025-01-15');
      });
    });

    describe('plan-sprint prompt', () => {
      it('generates sprint planning prompt', () => {
        const result = handler.getPrompt('plan-sprint', {
          sprint_name: 'Sprint 43'
        });

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('Sprint 43');
        expect(result?.messages[0].content.text).toContain('Capacity');
        expect(result?.messages[0].content.text).toContain('backlog');
      });

      it('includes capacity when provided', () => {
        const result = handler.getPrompt('plan-sprint', {
          sprint_name: 'Sprint 43',
          capacity: '40'
        });

        expect(result?.messages[0].content.text).toContain('40 story points');
      });
    });

    describe('close-milestone prompt', () => {
      it('generates milestone closing prompt', () => {
        const result = handler.getPrompt('close-milestone', {
          milestone_id: '123'
        });

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('incomplete issues');
        expect(result?.messages[0].content.text).toContain('retrospective');
      });
    });

    describe('delete-milestone prompt', () => {
      it('includes warning about deletion', () => {
        const result = handler.getPrompt('delete-milestone', {
          milestone_id: '456'
        });

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('WARNING');
        expect(result?.messages[0].content.text).toContain('confirmation');
      });
    });

    describe('daily-standup prompt', () => {
      it('generates standup prompt', () => {
        const result = handler.getPrompt('daily-standup', {});

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('yesterday');
        expect(result?.messages[0].content.text).toContain('today');
        expect(result?.messages[0].content.text).toContain('Blockers');
      });
    });

    describe('release-notes prompt', () => {
      it('generates release notes prompt', () => {
        const result = handler.getPrompt('release-notes', {
          milestone: 'v2.0'
        });

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('v2.0');
        expect(result?.messages[0].content.text).toContain('Features');
        expect(result?.messages[0].content.text).toContain('Bug Fixes');
      });
    });

    describe('backlog-review prompt', () => {
      it('generates backlog review prompt', () => {
        const result = handler.getPrompt('backlog-review', {});

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('Stale Issues');
        expect(result?.messages[0].content.text).toContain('Unassigned');
        expect(result?.messages[0].content.text).toContain('Recommendations');
      });
    });

    describe('project-overview prompt', () => {
      it('generates project overview prompt', () => {
        const result = handler.getPrompt('project-overview', {});

        expect(result).not.toBeNull();
        expect(result?.messages[0].content.text).toContain('getProject');
        expect(result?.messages[0].content.text).toContain('getIssueSchema');
        expect(result?.messages[0].content.text).toContain('listIssues');
      });
    });
  });
});
