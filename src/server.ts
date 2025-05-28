import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FileStorage } from './features/task-management/storage/file-storage.js';
import { FileStorage as MemoryFileStorage } from './features/agent-memories/storage/file-storage.js';
import { getVersion } from './utils/version.js';
import { z } from 'zod';

// Project tools
import { createListProjectsTool } from './features/task-management/tools/projects/list.js';
import { createCreateProjectTool } from './features/task-management/tools/projects/create.js';
import { createGetProjectTool } from './features/task-management/tools/projects/get.js';
import { createUpdateProjectTool } from './features/task-management/tools/projects/update.js';
import { createDeleteProjectTool } from './features/task-management/tools/projects/delete.js';

// Task tools
import { createListTasksTool } from './features/task-management/tools/tasks/list.js';
import { createCreateTaskTool } from './features/task-management/tools/tasks/create.js';
import { createGetTaskTool } from './features/task-management/tools/tasks/get.js';
import { createUpdateTaskTool } from './features/task-management/tools/tasks/update.js';
import { createDeleteTaskTool } from './features/task-management/tools/tasks/delete.js';

// Subtask tools
import { createListSubtasksTool } from './features/task-management/tools/subtasks/list.js';
import { createCreateSubtaskTool } from './features/task-management/tools/subtasks/create.js';
import { createGetSubtaskTool } from './features/task-management/tools/subtasks/get.js';
import { createUpdateSubtaskTool } from './features/task-management/tools/subtasks/update.js';
import { createDeleteSubtaskTool } from './features/task-management/tools/subtasks/delete.js';

// Memory tools
import { createCreateMemoryTool } from './features/agent-memories/tools/memories/create.js';
import { createSearchMemoriesTool } from './features/agent-memories/tools/memories/search.js';
import { createGetMemoryTool } from './features/agent-memories/tools/memories/get.js';
import { createListMemoriesTool } from './features/agent-memories/tools/memories/list.js';
import { createUpdateMemoryTool } from './features/agent-memories/tools/memories/update.js';
import { createDeleteMemoryTool } from './features/agent-memories/tools/memories/delete.js';

/**
 * Create storage instance for a specific working directory
 */
async function createStorage(workingDirectory: string): Promise<FileStorage> {
  const storage = new FileStorage(workingDirectory);
  await storage.initialize();
  return storage;
}

/**
 * Create memory storage instance for a specific working directory
 */
async function createMemoryStorage(workingDirectory: string): Promise<MemoryFileStorage> {
  const storage = new MemoryFileStorage(workingDirectory);
  await storage.initialize();
  return storage;
}

/**
 * Create and configure the MCP server for task management and agent memories
 */
export async function createServer(): Promise<McpServer> {
  // Create MCP server with dynamic version from package.json
  const server = new McpServer({
    name: '@pimzino/agentic-tools-mcp',
    version: getVersion()
  });

  // Register project management tools
  server.tool(
    'list_projects',
    'List all projects in the current working directory',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where project data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.')
    },
    async ({ workingDirectory }: { workingDirectory: string }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createListProjectsTool(storage);
        return await tool.handler();
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'create_project',
    'Create a new project with a name and description',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where project data will be stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      name: z.string().describe('The name of the new project'),
      description: z.string().describe('A detailed description of the project')
    },
    async ({ workingDirectory, name, description }: { workingDirectory: string; name: string; description: string }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createCreateProjectTool(storage);
        return await tool.handler({ name, description });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'get_project',
    'Retrieve detailed information about a specific project by its ID',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where project data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      id: z.string().describe('The unique identifier of the project to retrieve')
    },
    async ({ workingDirectory, id }: { workingDirectory: string; id: string }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createGetProjectTool(storage);
        return await tool.handler({ id });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'update_project',
    'Update an existing project\'s name and/or description',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where project data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      id: z.string().describe('The unique identifier of the project to update'),
      name: z.string().optional().describe('New name for the project (optional)'),
      description: z.string().optional().describe('New description for the project (optional)')
    },
    async ({ workingDirectory, id, name, description }: { workingDirectory: string; id: string; name?: string; description?: string }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createUpdateProjectTool(storage);
        return await tool.handler({ id, name, description });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'delete_project',
    'Delete a project permanently (requires explicit confirmation to prevent accidental deletion)',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where project data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      id: z.string().describe('The unique identifier of the project to delete'),
      confirm: z.boolean().describe('Must be set to true to confirm deletion (safety measure)')
    },
    async ({ workingDirectory, id, confirm }: { workingDirectory: string; id: string; confirm: boolean }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createDeleteProjectTool(storage);
        return await tool.handler({ id, confirm });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  // Register task management tools
  server.tool(
    'list_tasks',
    'List all tasks, optionally filtered by project ID',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where task data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      projectId: z.string().optional().describe('Filter tasks to only those belonging to this project (optional)')
    },
    async ({ workingDirectory, projectId }: { workingDirectory: string; projectId?: string }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createListTasksTool(storage);
        return await tool.handler({ projectId });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'create_task',
    'Create a new task within a specific project',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where task data will be stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      name: z.string().describe('The name/title of the new task'),
      details: z.string().describe('Detailed description of what the task involves'),
      projectId: z.string().describe('The ID of the project this task belongs to')
    },
    async ({ workingDirectory, name, details, projectId }: { workingDirectory: string; name: string; details: string; projectId: string }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createCreateTaskTool(storage);
        return await tool.handler({ name, details, projectId });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'get_task',
    'Retrieve detailed information about a specific task by its ID',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where task data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      id: z.string().describe('The unique identifier of the task to retrieve')
    },
    async ({ workingDirectory, id }: { workingDirectory: string; id: string }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createGetTaskTool(storage);
        return await tool.handler({ id });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'update_task',
    'Update an existing task\'s name, details, and/or completion status',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where task data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      id: z.string().describe('The unique identifier of the task to update'),
      name: z.string().optional().describe('New name/title for the task (optional)'),
      details: z.string().optional().describe('New detailed description for the task (optional)'),
      completed: z.boolean().optional().describe('Mark task as completed (true) or incomplete (false) (optional)')
    },
    async ({ workingDirectory, id, name, details, completed }: { workingDirectory: string; id: string; name?: string; details?: string; completed?: boolean }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createUpdateTaskTool(storage);
        return await tool.handler({ id, name, details, completed });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'delete_task',
    'Delete a task permanently (requires explicit confirmation to prevent accidental deletion)',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where task data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      id: z.string().describe('The unique identifier of the task to delete'),
      confirm: z.boolean().describe('Must be set to true to confirm deletion (safety measure)')
    },
    async ({ workingDirectory, id, confirm }: { workingDirectory: string; id: string; confirm: boolean }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createDeleteTaskTool(storage);
        return await tool.handler({ id, confirm });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  // Register subtask management tools
  server.tool(
    'list_subtasks',
    'List all subtasks, optionally filtered by task ID or project ID',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where subtask data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      taskId: z.string().optional().describe('Filter subtasks to only those belonging to this task (optional)'),
      projectId: z.string().optional().describe('Filter subtasks to only those in this project (optional)')
    },
    async ({ workingDirectory, taskId, projectId }: { workingDirectory: string; taskId?: string; projectId?: string }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createListSubtasksTool(storage);
        return await tool.handler({ taskId, projectId });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'create_subtask',
    'Create a new subtask within a specific task',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where subtask data will be stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      name: z.string().describe('The name/title of the new subtask'),
      details: z.string().describe('Detailed description of what the subtask involves'),
      taskId: z.string().describe('The ID of the parent task this subtask belongs to')
    },
    async ({ workingDirectory, name, details, taskId }: { workingDirectory: string; name: string; details: string; taskId: string }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createCreateSubtaskTool(storage);
        return await tool.handler({ name, details, taskId });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'get_subtask',
    'Retrieve detailed information about a specific subtask by its ID',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where subtask data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      id: z.string().describe('The unique identifier of the subtask to retrieve')
    },
    async ({ workingDirectory, id }: { workingDirectory: string; id: string }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createGetSubtaskTool(storage);
        return await tool.handler({ id });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'update_subtask',
    'Update an existing subtask\'s name, details, and/or completion status',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where subtask data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      id: z.string().describe('The unique identifier of the subtask to update'),
      name: z.string().optional().describe('New name/title for the subtask (optional)'),
      details: z.string().optional().describe('New detailed description for the subtask (optional)'),
      completed: z.boolean().optional().describe('Mark subtask as completed (true) or incomplete (false) (optional)')
    },
    async ({ workingDirectory, id, name, details, completed }: { workingDirectory: string; id: string; name?: string; details?: string; completed?: boolean }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createUpdateSubtaskTool(storage);
        return await tool.handler({ id, name, details, completed });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'delete_subtask',
    'Delete a subtask permanently (requires explicit confirmation to prevent accidental deletion)',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where subtask data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      id: z.string().describe('The unique identifier of the subtask to delete'),
      confirm: z.boolean().describe('Must be set to true to confirm deletion (safety measure)')
    },
    async ({ workingDirectory, id, confirm }: { workingDirectory: string; id: string; confirm: boolean }) => {
      try {
        const storage = await createStorage(workingDirectory);
        const tool = createDeleteSubtaskTool(storage);
        return await tool.handler({ id, confirm });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  // Register agent memory management tools
  server.tool(
    'create_memory',
    'Create a new memory with JSON file storage',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where memory data will be stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      title: z.string().describe('Short title for the memory (max 50 characters for better file organization)'),
      content: z.string().describe('Detailed memory content/text (no character limit)'),
      metadata: z.record(z.any()).optional().describe('Optional metadata as key-value pairs for additional context'),
      category: z.string().optional().describe('Optional category to organize memories (e.g., "user_preferences", "project_context")')
    },
    async ({ workingDirectory, title, content, metadata, category }: {
      workingDirectory: string;
      title: string;
      content: string;
      metadata?: Record<string, any>;
      category?: string;
    }) => {
      try {
        const storage = await createMemoryStorage(workingDirectory);
        const tool = createCreateMemoryTool(storage);
        return await tool.handler({ title, content, metadata, category });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'search_memories',
    'Search memories using text content matching to find relevant content',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where memory data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      query: z.string().describe('The search query text to find matching memories'),
      limit: z.number().min(1).max(100).optional().describe('Maximum number of results to return (default: 10)'),
      threshold: z.number().min(0).max(1).optional().describe('Minimum relevance threshold 0-1 (default: 0.3)'),
      category: z.string().optional().describe('Filter results to memories in this specific category')
    },
    async ({ workingDirectory, query, limit, threshold, category }: {
      workingDirectory: string;
      query: string;
      limit?: number;
      threshold?: number;
      category?: string;
    }) => {
      try {
        const storage = await createMemoryStorage(workingDirectory);
        const tool = createSearchMemoriesTool(storage);
        return await tool.handler({ query, limit, threshold, category });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'get_memory',
    'Retrieve detailed information about a specific memory by its ID',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where memory data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      id: z.string().describe('The unique identifier of the memory to retrieve')
    },
    async ({ workingDirectory, id }: { workingDirectory: string; id: string }) => {
      try {
        const storage = await createMemoryStorage(workingDirectory);
        const tool = createGetMemoryTool(storage);
        return await tool.handler({ id });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'list_memories',
    'List memories with optional filtering by category and limit',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where memory data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      category: z.string().optional().describe('Filter to memories in this specific category'),
      limit: z.number().min(1).max(1000).optional().describe('Maximum number of memories to return (default: 50)')
    },
    async ({ workingDirectory, category, limit }: {
      workingDirectory: string;
      category?: string;
      limit?: number;
    }) => {
      try {
        const storage = await createMemoryStorage(workingDirectory);
        const tool = createListMemoriesTool(storage);
        return await tool.handler({ category, limit });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'update_memory',
    'Update an existing memory\'s content, metadata, or category',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where memory data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      id: z.string().describe('The unique identifier of the memory to update'),
      title: z.string().optional().describe('New title for the memory (max 50 characters for better file organization)'),
      content: z.string().optional().describe('New detailed content for the memory (no character limit)'),
      metadata: z.record(z.any()).optional().describe('New metadata as key-value pairs (replaces existing metadata)'),
      category: z.string().optional().describe('New category for organizing the memory')
    },
    async ({ workingDirectory, id, title, content, metadata, category }: {
      workingDirectory: string;
      id: string;
      title?: string;
      content?: string;
      metadata?: Record<string, any>;
      category?: string;
    }) => {
      try {
        const storage = await createMemoryStorage(workingDirectory);
        const tool = createUpdateMemoryTool(storage);
        return await tool.handler({ id, title, content, metadata, category });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  server.tool(
    'delete_memory',
    'Delete a memory permanently (requires explicit confirmation to prevent accidental deletion)',
    {
      workingDirectory: z.string().describe('The full absolute path to the working directory where memory data is stored. MUST be an absolute path, never relative. Windows: "C:\\Users\\username\\project" or "D:\\projects\\my-app". Unix/Linux/macOS: "/home/username/project" or "/Users/username/project". Do NOT use: ".", "..", "~", "./folder", "../folder" or any relative paths. Ensure the path exists and is accessible before calling this tool.'),
      id: z.string().describe('The unique identifier of the memory to delete'),
      confirm: z.boolean().describe('Must be set to true to confirm deletion (safety measure)')
    },
    async ({ workingDirectory, id, confirm }: { workingDirectory: string; id: string; confirm: boolean }) => {
      try {
        const storage = await createMemoryStorage(workingDirectory);
        const tool = createDeleteMemoryTool(storage);
        return await tool.handler({ id, confirm });
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  );

  return server;
}
