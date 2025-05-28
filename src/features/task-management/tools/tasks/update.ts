import { z } from 'zod';
import { Storage } from '../../storage/storage.js';

/**
 * Update an existing task
 *
 * @param storage - Storage instance
 * @returns MCP tool handler for updating tasks
 */
export function createUpdateTaskTool(storage: Storage) {
  return {
    name: 'update_task',
    description: 'Update the name, details, and/or completion status of an existing task',
    inputSchema: {
      id: z.string(),
      name: z.string().optional(),
      details: z.string().optional(),
      completed: z.boolean().optional()
    },
    handler: async ({ id, name, details, completed }: { id: string; name?: string; details?: string; completed?: boolean }) => {
      try {
        // Validate inputs
        if (!id || id.trim().length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Task ID is required.'
            }],
            isError: true
          };
        }

        if (name !== undefined && (!name || name.trim().length === 0)) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Task name must not be empty.'
            }],
            isError: true
          };
        }

        if (name !== undefined && name.trim().length > 100) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Task name must be 100 characters or less.'
            }],
            isError: true
          };
        }

        if (details !== undefined && (!details || details.trim().length === 0)) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Task details must not be empty.'
            }],
            isError: true
          };
        }

        if (details !== undefined && details.trim().length > 2000) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Task details must be 2000 characters or less.'
            }],
            isError: true
          };
        }

        if (name === undefined && details === undefined && completed === undefined) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: At least one field (name, details, or completed) must be provided for update.'
            }],
            isError: true
          };
        }

        const existingTask = await storage.getTask(id.trim());

        if (!existingTask) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error: Task with ID "${id}" not found. Use list_tasks to see all available tasks.`
            }],
            isError: true
          };
        }

        // Check for name uniqueness within the same project if name is being updated
        if (name && name.toLowerCase() !== existingTask.name.toLowerCase()) {
          const existingTasks = await storage.getTasks(existingTask.projectId);
          const nameExists = existingTasks.some(t => t.id !== id && t.name.toLowerCase() === name.toLowerCase());

          if (nameExists) {
            return {
              content: [{
                type: 'text' as const,
                text: `Error: A task with the name "${name}" already exists in this project. Please choose a different name.`
              }],
              isError: true
            };
          }
        }

        const updates: any = {
          updatedAt: new Date().toISOString()
        };

        if (name !== undefined) {
          updates.name = name.trim();
        }

        if (details !== undefined) {
          updates.details = details.trim();
        }

        if (completed !== undefined) {
          updates.completed = completed;
        }

        const updatedTask = await storage.updateTask(id, updates);

        if (!updatedTask) {
          return {
            content: [{
              type: 'text' as const,
              text: `Error: Failed to update task with ID "${id}".`
            }],
            isError: true
          };
        }

        // Get project information for display
        const project = await storage.getProject(updatedTask.projectId);
        const projectName = project ? project.name : 'Unknown Project';

        const changedFields = [];
        if (name !== undefined) changedFields.push('name');
        if (details !== undefined) changedFields.push('details');
        if (completed !== undefined) changedFields.push('completion status');

        const status = updatedTask.completed ? '✅ Completed' : '⏳ Pending';

        return {
          content: [{
            type: 'text' as const,
            text: `✅ Task updated successfully!

**${updatedTask.name}** (ID: ${updatedTask.id})
Project: ${projectName}
Status: ${status}
Details: ${updatedTask.details}
Last Updated: ${new Date(updatedTask.updatedAt).toLocaleString()}

Updated fields: ${changedFields.join(', ')}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error updating task: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  };
}
