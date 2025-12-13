/**
 * MCP Prompts for Kiket issue and project management
 */

import type { PromptDefinition, GetPromptResult } from './types.js';

// ============================================================================
// Prompt Definitions
// ============================================================================

const promptDefinitions: PromptDefinition[] = [
  // Issue Management Prompts
  {
    name: 'create-issue',
    description: 'Create a new issue with proper structure and fields. Guides through title, description, type, priority, and assignment.',
    arguments: [
      { name: 'title', description: 'Brief title for the issue', required: true },
      { name: 'type', description: 'Issue type: Epic, UserStory, Task, Bug, Spike', required: false },
      { name: 'priority', description: 'Priority: critical, high, medium, low', required: false },
      { name: 'description', description: 'Detailed description of the issue', required: false },
      { name: 'project_key', description: 'Project key to create the issue in', required: false }
    ]
  },
  {
    name: 'create-bug-report',
    description: 'Create a well-structured bug report with reproduction steps, expected/actual behavior, and environment details.',
    arguments: [
      { name: 'title', description: 'Brief bug title', required: true },
      { name: 'steps', description: 'Steps to reproduce the bug', required: false },
      { name: 'expected', description: 'Expected behavior', required: false },
      { name: 'actual', description: 'Actual behavior', required: false },
      { name: 'priority', description: 'Bug priority: critical, high, medium, low', required: false }
    ]
  },
  {
    name: 'create-feature',
    description: 'Create a feature request or user story with acceptance criteria and breakdown into tasks.',
    arguments: [
      { name: 'title', description: 'Feature title', required: true },
      { name: 'user_story', description: 'As a [user], I want [goal] so that [benefit]', required: false },
      { name: 'acceptance_criteria', description: 'List of acceptance criteria', required: false },
      { name: 'breakdown', description: 'Whether to break down into subtasks', required: false }
    ]
  },
  {
    name: 'update-issue',
    description: 'Update an existing issue - modify fields, change status, reassign, or add comments.',
    arguments: [
      { name: 'issue_id', description: 'Issue ID or key to update', required: true },
      { name: 'changes', description: 'Description of changes to make', required: false }
    ]
  },
  {
    name: 'bulk-update-issues',
    description: 'Update multiple issues at once - useful for sprint cleanup, reassignment, or status changes.',
    arguments: [
      { name: 'filter', description: 'How to select issues (e.g., "all bugs in backlog", "unassigned tasks")', required: true },
      { name: 'action', description: 'What to do (e.g., "assign to Alice", "move to in_progress", "set priority high")', required: true }
    ]
  },
  {
    name: 'close-issue',
    description: 'Close or resolve an issue with appropriate status transition and resolution comment.',
    arguments: [
      { name: 'issue_id', description: 'Issue ID or key to close', required: true },
      { name: 'resolution', description: 'Resolution type: done, wont_fix, duplicate, cannot_reproduce', required: false },
      { name: 'comment', description: 'Closing comment or notes', required: false }
    ]
  },
  {
    name: 'delete-issue',
    description: 'Delete an issue permanently. Use with caution - considers moving to cancelled state instead.',
    arguments: [
      { name: 'issue_id', description: 'Issue ID or key to delete', required: true },
      { name: 'reason', description: 'Reason for deletion', required: false }
    ]
  },

  // Milestone Management Prompts
  {
    name: 'create-milestone',
    description: 'Create a new milestone/sprint with dates, goals, and initial issue assignment.',
    arguments: [
      { name: 'title', description: 'Milestone title (e.g., "Sprint 42", "v2.0 Release")', required: true },
      { name: 'start_date', description: 'Start date (YYYY-MM-DD)', required: false },
      { name: 'due_date', description: 'Due/end date (YYYY-MM-DD)', required: false },
      { name: 'description', description: 'Milestone goals and scope', required: false }
    ]
  },
  {
    name: 'plan-sprint',
    description: 'Plan a sprint by selecting issues from backlog, estimating capacity, and setting sprint goals.',
    arguments: [
      { name: 'sprint_name', description: 'Sprint name or number', required: true },
      { name: 'capacity', description: 'Team capacity in story points or hours', required: false },
      { name: 'goals', description: 'Sprint goals', required: false },
      { name: 'duration', description: 'Sprint duration in weeks (default: 2)', required: false }
    ]
  },
  {
    name: 'update-milestone',
    description: 'Update milestone details, dates, or reassign issues.',
    arguments: [
      { name: 'milestone_id', description: 'Milestone ID to update', required: true },
      { name: 'changes', description: 'Description of changes to make', required: false }
    ]
  },
  {
    name: 'close-milestone',
    description: 'Close a milestone/sprint, review completion, and handle incomplete issues.',
    arguments: [
      { name: 'milestone_id', description: 'Milestone ID to close', required: true },
      { name: 'incomplete_action', description: 'What to do with incomplete issues: move_to_next, return_to_backlog', required: false }
    ]
  },
  {
    name: 'delete-milestone',
    description: 'Delete a milestone and decide what to do with associated issues.',
    arguments: [
      { name: 'milestone_id', description: 'Milestone ID to delete', required: true },
      { name: 'issue_action', description: 'What to do with issues: unassign, move_to_backlog, delete', required: false }
    ]
  },

  // Analysis & Reporting Prompts
  {
    name: 'daily-standup',
    description: 'Generate a daily standup summary based on recent issue activity.',
    arguments: [
      { name: 'user', description: 'User to generate standup for (default: current user)', required: false },
      { name: 'days', description: 'Number of days to look back (default: 1)', required: false }
    ]
  },
  {
    name: 'release-notes',
    description: 'Generate release notes from completed issues in a milestone.',
    arguments: [
      { name: 'milestone', description: 'Milestone name or ID', required: true },
      { name: 'format', description: 'Output format: markdown, plain, changelog', required: false }
    ]
  },
  {
    name: 'backlog-review',
    description: 'Review and clean up the backlog - identify stale issues, duplicates, and prioritization opportunities.',
    arguments: [
      { name: 'project_key', description: 'Project to review (default: current project)', required: false },
      { name: 'stale_days', description: 'Days without activity to consider stale (default: 30)', required: false }
    ]
  },
  {
    name: 'project-overview',
    description: 'Get an overview of a project including issue counts, team members, recent activity, and workflow states.',
    arguments: [
      { name: 'project_key', description: 'Project key to overview', required: false }
    ]
  }
];

// ============================================================================
// Prompt Templates
// ============================================================================

function getPromptTemplate(name: string, args: Record<string, string>): GetPromptResult | null {
  switch (name) {
    case 'create-issue':
      return createIssuePrompt(args);
    case 'create-bug-report':
      return createBugReportPrompt(args);
    case 'create-feature':
      return createFeaturePrompt(args);
    case 'update-issue':
      return updateIssuePrompt(args);
    case 'bulk-update-issues':
      return bulkUpdateIssuesPrompt(args);
    case 'close-issue':
      return closeIssuePrompt(args);
    case 'delete-issue':
      return deleteIssuePrompt(args);
    case 'create-milestone':
      return createMilestonePrompt(args);
    case 'plan-sprint':
      return planSprintPrompt(args);
    case 'update-milestone':
      return updateMilestonePrompt(args);
    case 'close-milestone':
      return closeMilestonePrompt(args);
    case 'delete-milestone':
      return deleteMilestonePrompt(args);
    case 'daily-standup':
      return dailyStandupPrompt(args);
    case 'release-notes':
      return releaseNotesPrompt(args);
    case 'backlog-review':
      return backlogReviewPrompt(args);
    case 'project-overview':
      return projectOverviewPrompt(args);
    default:
      return null;
  }
}

// ============================================================================
// Issue Prompts
// ============================================================================

function createIssuePrompt(args: Record<string, string>): GetPromptResult {
  const { title, type = 'Task', priority = 'medium', description = '', project_key } = args;

  const projectContext = project_key ? `in project "${project_key}"` : '';

  return {
    description: `Create a new ${type} issue ${projectContext}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Create a new issue ${projectContext} with the following details:

**Title:** ${title}
**Type:** ${type}
**Priority:** ${priority}
${description ? `**Description:** ${description}` : ''}

Please:
1. First, call getIssueSchema to understand available issue types, priorities, and custom fields
2. Create the issue using createIssue with appropriate fields
3. Return the created issue details including its ID/key

If the title is vague, ask for clarification before creating.
If this should be linked to a parent issue (e.g., Task under UserStory, UserStory under Epic), ask about the parent.`
        }
      }
    ]
  };
}

function createBugReportPrompt(args: Record<string, string>): GetPromptResult {
  const { title, steps = '', expected = '', actual = '', priority = 'high' } = args;

  const descriptionParts = [];
  if (steps) descriptionParts.push(`## Steps to Reproduce\n${steps}`);
  if (expected) descriptionParts.push(`## Expected Behavior\n${expected}`);
  if (actual) descriptionParts.push(`## Actual Behavior\n${actual}`);

  const hasDetails = descriptionParts.length > 0;

  return {
    description: 'Create a structured bug report',
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Create a bug report with the following information:

**Title:** ${title}
**Priority:** ${priority}
**Type:** Bug

${hasDetails ? descriptionParts.join('\n\n') : 'Please gather the following information:'}

${!hasDetails ? `I need to document this bug properly. Please help me capture:
1. Steps to reproduce the issue
2. Expected behavior
3. Actual behavior observed
4. Environment details (browser, OS, version if relevant)
5. Any error messages or screenshots mentioned` : ''}

Once we have all details, create the issue using createIssue with:
- issue_type: "Bug"
- priority: "${priority}"
- A well-formatted description with all the bug details`
        }
      }
    ]
  };
}

function createFeaturePrompt(args: Record<string, string>): GetPromptResult {
  const { title, user_story = '', acceptance_criteria = '', breakdown = 'false' } = args;
  const shouldBreakdown = breakdown === 'true' || breakdown === 'yes';

  return {
    description: 'Create a feature request or user story',
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Create a feature/user story:

**Title:** ${title}
${user_story ? `**User Story:** ${user_story}` : ''}
${acceptance_criteria ? `**Acceptance Criteria:**\n${acceptance_criteria}` : ''}

Please:
1. ${user_story ? 'Use the provided user story' : 'Help me write a user story in the format: "As a [user type], I want [goal] so that [benefit]"'}
2. ${acceptance_criteria ? 'Use the provided acceptance criteria' : 'Define clear acceptance criteria as a checklist'}
3. Create the issue as a UserStory type with the formatted description

${shouldBreakdown ? `
After creating the UserStory:
4. Break it down into Tasks (typically 3-5 subtasks)
5. Create each task as a child issue linked to this UserStory
6. Each task should be independently completable and testable` : ''}

Return the created issue(s) with their IDs/keys.`
        }
      }
    ]
  };
}

function updateIssuePrompt(args: Record<string, string>): GetPromptResult {
  const { issue_id, changes = '' } = args;

  return {
    description: `Update issue ${issue_id}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Update issue ${issue_id}${changes ? ` with the following changes: ${changes}` : ''}

Please:
1. First, call getIssue to fetch the current state of issue ${issue_id}
2. Show me the current issue details
3. ${changes ? `Apply the requested changes: ${changes}` : 'Ask what changes I want to make'}
4. Use updateIssue to apply the changes
5. If a status change is needed, use transitionIssue with the appropriate transition
6. Confirm the changes were applied successfully`
        }
      }
    ]
  };
}

function bulkUpdateIssuesPrompt(args: Record<string, string>): GetPromptResult {
  const { filter, action } = args;

  return {
    description: `Bulk update issues matching "${filter}"`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Bulk update issues:

**Filter:** ${filter}
**Action:** ${action}

Please:
1. Use listIssues to find all issues matching the filter criteria: "${filter}"
2. Show me the list of issues that will be affected (count and titles)
3. Ask for confirmation before proceeding
4. Once confirmed, apply the action "${action}" to each issue using updateIssue or transitionIssue
5. Report the results: how many succeeded, any failures

Be careful with bulk operations - always confirm before executing.`
        }
      }
    ]
  };
}

function closeIssuePrompt(args: Record<string, string>): GetPromptResult {
  const { issue_id, resolution = 'done', comment = '' } = args;

  return {
    description: `Close issue ${issue_id}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Close issue ${issue_id}:

**Resolution:** ${resolution}
${comment ? `**Comment:** ${comment}` : ''}

Please:
1. Fetch the current issue state using getIssue
2. Check if the issue can be closed (is it already closed? are there blockers?)
3. ${comment ? `Add a closing comment: "${comment}"` : 'Ask if I want to add a closing comment'}
4. Use transitionIssue to move the issue to the appropriate closed state
5. Confirm the issue has been closed

Valid resolution types:
- done: Work completed successfully
- wont_fix: Decided not to address this
- duplicate: Duplicate of another issue
- cannot_reproduce: Bug could not be reproduced`
        }
      }
    ]
  };
}

function deleteIssuePrompt(args: Record<string, string>): GetPromptResult {
  const { issue_id, reason = '' } = args;

  return {
    description: `Delete issue ${issue_id}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `⚠️ Delete issue ${issue_id}
${reason ? `**Reason:** ${reason}` : ''}

**WARNING: Deletion is permanent and cannot be undone.**

Please:
1. Fetch the issue details using getIssue
2. Show me what will be deleted (title, status, any child issues)
3. Consider alternatives:
   - Move to "Cancelled" status instead of deleting
   - Archive if that's available
4. Ask for explicit confirmation: "Type DELETE to confirm"
5. Only proceed with deletion if explicitly confirmed

${!reason ? 'Please explain why this issue should be deleted.' : ''}`
        }
      }
    ]
  };
}

// ============================================================================
// Milestone Prompts
// ============================================================================

function createMilestonePrompt(args: Record<string, string>): GetPromptResult {
  const { title, start_date = '', due_date = '', description = '' } = args;

  return {
    description: `Create milestone "${title}"`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Create a new milestone:

**Title:** ${title}
${start_date ? `**Start Date:** ${start_date}` : ''}
${due_date ? `**Due Date:** ${due_date}` : ''}
${description ? `**Description/Goals:** ${description}` : ''}

Please:
1. Create the milestone using createMilestone with the provided details
2. ${!start_date || !due_date ? 'Ask for the missing dates if not provided' : ''}
3. ${!description ? 'Ask about the milestone goals and scope' : ''}
4. Return the created milestone details
5. Ask if I want to assign any existing issues to this milestone`
        }
      }
    ]
  };
}

function planSprintPrompt(args: Record<string, string>): GetPromptResult {
  const { sprint_name, capacity = '', goals = '', duration = '2' } = args;

  return {
    description: `Plan sprint "${sprint_name}"`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Plan sprint: ${sprint_name}

${capacity ? `**Team Capacity:** ${capacity} story points` : ''}
${goals ? `**Sprint Goals:** ${goals}` : ''}
**Duration:** ${duration} weeks

Please help me plan this sprint:

1. **Create the Sprint**
   - Create a milestone for "${sprint_name}"
   - Set dates based on ${duration}-week duration starting from today/next Monday

2. **Review Backlog**
   - Use listIssues to fetch prioritized backlog items (status: backlog, ordered by priority)
   - Show top candidates for the sprint

3. **Capacity Planning**
   ${capacity ? `- Target: ${capacity} story points` : '- Ask about team capacity in story points or hours'}
   - Sum up story points as we select issues
   - Warn if we're over capacity

4. **Select Issues**
   - Help me choose which issues to include
   - Consider dependencies between issues
   - Balance different types of work (features, bugs, tech debt)

5. **Finalize**
   - Assign selected issues to the milestone
   - Summarize the sprint plan: total points, issue count, goals

${!goals ? 'What are the main goals for this sprint?' : ''}`
        }
      }
    ]
  };
}

function updateMilestonePrompt(args: Record<string, string>): GetPromptResult {
  const { milestone_id, changes = '' } = args;

  return {
    description: `Update milestone ${milestone_id}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Update milestone ${milestone_id}${changes ? `: ${changes}` : ''}

Please:
1. Fetch the current milestone details using getMilestone
2. Show me the current state (title, dates, issue count, progress)
3. ${changes ? `Apply the requested changes: ${changes}` : 'Ask what changes I want to make'}

Common updates:
- Extend the due date
- Update the description/goals
- Rename the milestone
- Add or remove issues

4. Use updateMilestone to apply changes
5. Confirm the changes were applied`
        }
      }
    ]
  };
}

function closeMilestonePrompt(args: Record<string, string>): GetPromptResult {
  const { milestone_id, incomplete_action = '' } = args;

  return {
    description: `Close milestone ${milestone_id}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Close milestone ${milestone_id}

Please:
1. Fetch milestone details and associated issues
2. Show a summary:
   - Total issues in milestone
   - Completed issues
   - Incomplete issues
   - Completion percentage

3. Handle incomplete issues (if any):
   ${incomplete_action ? `Action: ${incomplete_action}` : 'Ask what to do with incomplete issues:'}
   - **move_to_next**: Move to the next milestone/sprint
   - **return_to_backlog**: Return to backlog for re-prioritization
   - **keep**: Leave assigned to this milestone (mark as incomplete)

4. Close the milestone
5. Generate a brief retrospective summary:
   - What was completed
   - What wasn't completed and why
   - Velocity achieved`
        }
      }
    ]
  };
}

function deleteMilestonePrompt(args: Record<string, string>): GetPromptResult {
  const { milestone_id, issue_action = '' } = args;

  return {
    description: `Delete milestone ${milestone_id}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `⚠️ Delete milestone ${milestone_id}

**WARNING: This will delete the milestone.**

Please:
1. Fetch milestone details and count associated issues
2. Show what will be affected

3. Handle associated issues:
   ${issue_action ? `Action: ${issue_action}` : 'Ask what to do with issues:'}
   - **unassign**: Remove milestone assignment (issues remain)
   - **move_to_backlog**: Unassign and move to backlog status
   - **reassign**: Move to a different milestone

4. Ask for explicit confirmation
5. Process the issues first, then delete the milestone
6. Confirm deletion`
        }
      }
    ]
  };
}

// ============================================================================
// Analysis Prompts
// ============================================================================

function dailyStandupPrompt(args: Record<string, string>): GetPromptResult {
  const { user = '', days = '1' } = args;

  return {
    description: 'Generate daily standup summary',
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Generate a daily standup summary${user ? ` for ${user}` : ''}

Please analyze the last ${days} day(s) of activity and create a standup report:

1. **What I did yesterday:**
   - List issues that were completed or had status changes
   - List issues that had comments or updates

2. **What I'm doing today:**
   - List issues currently in progress
   - Identify the highest priority item to focus on

3. **Blockers:**
   - List any issues marked as blocked
   - Identify issues with no recent activity that might be stuck

Use listIssues with appropriate filters:
- Filter by assignee${user ? `: ${user}` : ' (current user)'}
- Check recently updated issues
- Check issues in "in_progress" status

Format the output as a clear standup update I can share with my team.`
        }
      }
    ]
  };
}

function releaseNotesPrompt(args: Record<string, string>): GetPromptResult {
  const { milestone, format = 'markdown' } = args;

  return {
    description: `Generate release notes for ${milestone}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Generate release notes for milestone: ${milestone}

Please:
1. Fetch all issues in the milestone
2. Filter to only completed/closed issues
3. Group issues by type:
   - 🚀 Features (UserStory, Feature, Epic)
   - 🐛 Bug Fixes (Bug)
   - 🔧 Improvements (Task, Enhancement)
   - 📚 Documentation
   - ⚡ Performance

4. Format as ${format}:
   ${format === 'markdown' ? '- Use markdown with headers and bullet points' : ''}
   ${format === 'changelog' ? '- Use Keep a Changelog format (Added, Changed, Fixed, etc.)' : ''}
   ${format === 'plain' ? '- Use plain text with clear sections' : ''}

5. Include:
   - Version/milestone name
   - Release date
   - Summary of changes
   - List of changes by category
   - Contributors (assignees)

Make it suitable for sharing with users/stakeholders.`
        }
      }
    ]
  };
}

function backlogReviewPrompt(args: Record<string, string>): GetPromptResult {
  const { project_key = '', stale_days = '30' } = args;

  return {
    description: 'Review and clean up backlog',
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Review the backlog${project_key ? ` for project ${project_key}` : ''}

Please analyze the backlog and identify:

1. **Stale Issues** (no activity in ${stale_days}+ days)
   - List issues that haven't been updated
   - Suggest: close, re-prioritize, or assign

2. **Unassigned Issues**
   - List issues without an assignee
   - Especially high-priority unassigned items

3. **Priority Review**
   - Any low-priority issues that have been waiting too long
   - High-priority issues that aren't being worked on

4. **Potential Duplicates**
   - Issues with similar titles or descriptions

5. **Missing Information**
   - Issues without descriptions
   - Bugs without reproduction steps

6. **Recommendations**
   - Issues to close as stale
   - Issues that need re-prioritization
   - Issues that need more detail before they can be worked on

Use listIssues with status: "backlog" and analyze the results.
Present findings in a clear, actionable format.`
        }
      }
    ]
  };
}

function projectOverviewPrompt(args: Record<string, string>): GetPromptResult {
  const { project_key = '' } = args;

  return {
    description: `Get project overview${project_key ? ` for ${project_key}` : ''}`,
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `Give me an overview of ${project_key ? `project ${project_key}` : 'the current project'}

Please gather and present:

1. **Project Info**
   - Use getProject to fetch project details
   - Show project name, key, description

2. **Issue Schema**
   - Use getIssueSchema to understand the workflow
   - List available issue types, statuses, and priorities

3. **Current State**
   - Use listIssues to get issue counts by status
   - Show: Total issues, Open, In Progress, Done
   - Recent activity

4. **Team**
   - Use listUsers to see team members
   - Show who's assigned to active issues

5. **Milestones**
   - Use listMilestones to see upcoming milestones
   - Show active sprints/releases

6. **Summary**
   - Overall project health
   - Any concerns (too many blockers, unassigned work, etc.)
   - Recommendations

Present this as a clear dashboard-style overview.`
        }
      }
    ]
  };
}

// ============================================================================
// Exports
// ============================================================================

export class PromptsHandler {
  listPrompts(): PromptDefinition[] {
    return promptDefinitions;
  }

  getPrompt(name: string, args: Record<string, string>): GetPromptResult | null {
    return getPromptTemplate(name, args);
  }
}
