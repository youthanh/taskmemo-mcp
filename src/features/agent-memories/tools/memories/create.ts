import { z } from 'zod';
import { randomUUID } from 'crypto';
import { MemoryStorage } from '../../storage/storage.js';
import { Memory } from '../../models/memory.js';

/**
 * Create a new memory
 *
 * @param storage - Memory storage instance
 * @returns MCP tool handler for creating memories
 */
export function createCreateMemoryTool(storage: MemoryStorage) {
  return {
    name: 'create_memory',
    description: 'Create a new memory in the agent memories system',
    inputSchema: {
      content: z.string(),
      metadata: z.record(z.any()).optional(),
      agentId: z.string().optional(),
      category: z.string().optional(),
      importance: z.number().min(1).max(10).optional(),
      embedding: z.array(z.number()).optional()
    },
    handler: async ({ 
      content, 
      metadata = {}, 
      agentId, 
      category, 
      importance,
      embedding 
    }: { 
      content: string; 
      metadata?: Record<string, any>; 
      agentId?: string; 
      category?: string; 
      importance?: number;
      embedding?: number[];
    }) => {
      try {
        // Validate inputs
        if (!content || content.trim().length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Memory content is required.'
            }],
            isError: true
          };
        }

        if (content.trim().length > 10000) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Memory content must be 10,000 characters or less.'
            }],
            isError: true
          };
        }

        if (importance !== undefined && (importance < 1 || importance > 10)) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Importance must be between 1 and 10.'
            }],
            isError: true
          };
        }

        if (agentId && agentId.trim().length > 100) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Agent ID must be 100 characters or less.'
            }],
            isError: true
          };
        }

        if (category && category.trim().length > 100) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Category must be 100 characters or less.'
            }],
            isError: true
          };
        }

        const now = new Date().toISOString();
        const memory: Memory = {
          id: randomUUID(),
          content: content.trim(),
          embedding,
          metadata,
          createdAt: now,
          updatedAt: now,
          agentId: agentId?.trim(),
          category: category?.trim(),
          importance
        };

        const createdMemory = await storage.createMemory(memory);

        return {
          content: [{
            type: 'text' as const,
            text: `✅ Memory created successfully!

**Memory ID:** ${createdMemory.id}
**Content:** ${createdMemory.content.substring(0, 200)}${createdMemory.content.length > 200 ? '...' : ''}
**Agent ID:** ${createdMemory.agentId || 'Not specified'}
**Category:** ${createdMemory.category || 'Not specified'}
**Importance:** ${createdMemory.importance || 'Not specified'}
**Created:** ${new Date(createdMemory.createdAt).toLocaleString()}
**Metadata:** ${Object.keys(createdMemory.metadata).length > 0 ? JSON.stringify(createdMemory.metadata, null, 2) : 'None'}

The memory has been stored and is ready for semantic search.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error creating memory: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  };
}
