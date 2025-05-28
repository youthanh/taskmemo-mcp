import { z } from 'zod';
import { randomUUID } from 'crypto';
import { Storage } from '../../storage/storage.js';
import { Task } from '../../models/task.js';

/**
 * Create a new task within a project
 *
 * @param storage - Storage instance
 * @returns MCP tool handler for creating tasks
 */
export function createCreateTaskTool(storage: Storage) {
  return {
    name: 'create_task',
    description: 'Create a new task within a specific project',
    inputSchema: {
      name: z.string(),
      details: z.string(),
      projectId: z.string()
    },
    handler: async ({ name, details, projectId }: { name: string; details: string; projectId: string }) => {
      try {
        // Validate inputs
        if (!name || name.trim().length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Task name is required.'
            }],
            isError: true
          };
        }

        if (name.trim().length > 100) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Task name must be 100 characters or less.'
            }],
            isError: true
          };
        }

        if (!details || details.trim().length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Task details are required.'
            }],
            isError: true
          };
        }

        if (details.trim().length > 2000) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Task details must be 2000 characters or less.'
            }],
            isError: true
          };
        }

        if (!projectId || projectId.trim().length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Project ID is required.'
            }],
            isError: true
          };
        }

        // Validate that project exists
        const project = await storage.getProject(projectId.trim());
        if (!project) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error: Project with ID "${projectId}" not found. Use list_projects to see all available projects.`
            }],
            isError: true
          };
        }

        // Check for duplicate task names within the same project
        const existingTasks = await storage.getTasks(projectId);
        const nameExists = existingTasks.some(t => t.name.toLowerCase() === name.toLowerCase());

        if (nameExists) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error: A task with the name "${name}" already exists in project "${project.name}". Please choose a different name.`
            }],
            isError: true
          };
        }

        const now = new Date().toISOString();
        const task: Task = {
          id: randomUUID(),
          name: name.trim(),
          details: details.trim(),
          projectId,
          completed: false,
          createdAt: now,
          updatedAt: now
        };

        const createdTask = await storage.createTask(task);

        return {
          content: [{
            type: 'text' as const,
            text: `✅ Task created successfully!

**${createdTask.name}** (ID: ${createdTask.id})
Project: ${project.name}
Details: ${createdTask.details}
Status: Pending
Created: ${new Date(createdTask.createdAt).toLocaleString()}

You can now add subtasks to this task using the create_subtask tool, or mark it as completed using update_task.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error creating task: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  };
}
