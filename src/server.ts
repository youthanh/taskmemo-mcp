import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { FileStorage } from './features/task-management/storage/file-storage.js';
import { LanceDBMemoryStorage } from './features/agent-memories/storage/lancedb-storage.js';
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
async function createMemoryStorage(workingDirectory: string): Promise<LanceDBMemoryStorage> {
  const storage = new LanceDBMemoryStorage(workingDirectory);
  await storage.initialize();
  return storage;
}

/**
 * Create and configure the MCP server for task management and agent memories
 */
export async function createServer(): Promise<McpServer> {
  // Create MCP server
  const server = new McpServer({
    name: '@pimzino/agentic-tools-mcp',
    version: '1.0.0'
  });

  // Register project management tools
  server.tool(
    'list_projects',
    {
      workingDirectory: z.string()
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
    {
      workingDirectory: z.string(),
      name: z.string(),
      description: z.string()
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
    {
      workingDirectory: z.string(),
      id: z.string()
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
    {
      workingDirectory: z.string(),
      id: z.string(),
      name: z.string().optional(),
      description: z.string().optional()
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
    {
      workingDirectory: z.string(),
      id: z.string(),
      confirm: z.boolean()
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
    {
      workingDirectory: z.string(),
      projectId: z.string().optional()
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
    {
      workingDirectory: z.string(),
      name: z.string(),
      details: z.string(),
      projectId: z.string()
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
    {
      workingDirectory: z.string(),
      id: z.string()
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
    {
      workingDirectory: z.string(),
      id: z.string(),
      name: z.string().optional(),
      details: z.string().optional(),
      completed: z.boolean().optional()
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
    {
      workingDirectory: z.string(),
      id: z.string(),
      confirm: z.boolean()
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
    {
      workingDirectory: z.string(),
      taskId: z.string().optional(),
      projectId: z.string().optional()
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
    {
      workingDirectory: z.string(),
      name: z.string(),
      details: z.string(),
      taskId: z.string()
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
    {
      workingDirectory: z.string(),
      id: z.string()
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
    {
      workingDirectory: z.string(),
      id: z.string(),
      name: z.string().optional(),
      details: z.string().optional(),
      completed: z.boolean().optional()
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
    {
      workingDirectory: z.string(),
      id: z.string(),
      confirm: z.boolean()
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
    'create_memory_Agentic_Tools',
    {
      workingDirectory: z.string(),
      content: z.string(),
      metadata: z.record(z.any()).optional(),
      agentId: z.string().optional(),
      category: z.string().optional(),
      importance: z.number().min(1).max(10).optional(),
      embedding: z.array(z.number()).optional()
    },
    async ({ workingDirectory, content, metadata, agentId, category, importance, embedding }: {
      workingDirectory: string;
      content: string;
      metadata?: Record<string, any>;
      agentId?: string;
      category?: string;
      importance?: number;
      embedding?: number[];
    }) => {
      try {
        const storage = await createMemoryStorage(workingDirectory);
        const tool = createCreateMemoryTool(storage);
        return await tool.handler({ content, metadata, agentId, category, importance, embedding });
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
    'search_memories_Agentic_Tools',
    {
      workingDirectory: z.string(),
      query: z.string(),
      limit: z.number().min(1).max(100).optional(),
      threshold: z.number().min(0).max(1).optional(),
      agentId: z.string().optional(),
      category: z.string().optional(),
      minImportance: z.number().min(1).max(10).optional()
    },
    async ({ workingDirectory, query, limit, threshold, agentId, category, minImportance }: {
      workingDirectory: string;
      query: string;
      limit?: number;
      threshold?: number;
      agentId?: string;
      category?: string;
      minImportance?: number;
    }) => {
      try {
        const storage = await createMemoryStorage(workingDirectory);
        const tool = createSearchMemoriesTool(storage);
        return await tool.handler({ query, limit, threshold, agentId, category, minImportance });
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
    'get_memory_Agentic_Tools',
    {
      workingDirectory: z.string(),
      id: z.string()
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
    'list_memories_Agentic_Tools',
    {
      workingDirectory: z.string(),
      agentId: z.string().optional(),
      category: z.string().optional(),
      limit: z.number().min(1).max(1000).optional()
    },
    async ({ workingDirectory, agentId, category, limit }: {
      workingDirectory: string;
      agentId?: string;
      category?: string;
      limit?: number;
    }) => {
      try {
        const storage = await createMemoryStorage(workingDirectory);
        const tool = createListMemoriesTool(storage);
        return await tool.handler({ agentId, category, limit });
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
    'update_memory_Agentic_Tools',
    {
      workingDirectory: z.string(),
      id: z.string(),
      content: z.string().optional(),
      metadata: z.record(z.any()).optional(),
      category: z.string().optional(),
      importance: z.number().min(1).max(10).optional()
    },
    async ({ workingDirectory, id, content, metadata, category, importance }: {
      workingDirectory: string;
      id: string;
      content?: string;
      metadata?: Record<string, any>;
      category?: string;
      importance?: number;
    }) => {
      try {
        const storage = await createMemoryStorage(workingDirectory);
        const tool = createUpdateMemoryTool(storage);
        return await tool.handler({ id, content, metadata, category, importance });
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
    'delete_memory_Agentic_Tools',
    {
      workingDirectory: z.string(),
      id: z.string(),
      confirm: z.boolean()
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
