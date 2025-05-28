import { z } from 'zod';
import { MemoryStorage } from '../../storage/storage.js';

/**
 * List memories with optional filtering
 *
 * @param storage - Memory storage instance
 * @returns MCP tool handler for listing memories
 */
export function createListMemoriesTool(storage: MemoryStorage) {
  return {
    name: 'list_memories',
    description: 'List memories with optional filtering by agent ID, category, and limit',
    inputSchema: {
      agentId: z.string().optional(),
      category: z.string().optional(),
      limit: z.number().min(1).max(1000).optional()
    },
    handler: async ({ 
      agentId, 
      category, 
      limit = 50 
    }: { 
      agentId?: string; 
      category?: string; 
      limit?: number; 
    }) => {
      try {
        // Validate inputs
        if (limit < 1 || limit > 1000) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Limit must be between 1 and 1000.'
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

        const memories = await storage.getMemories(
          agentId?.trim(), 
          category?.trim(), 
          limit
        );

        if (memories.length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: `📝 No memories found.

**Filters:** ${[
                agentId && `Agent: ${agentId}`,
                category && `Category: ${category}`
              ].filter(Boolean).join(', ') || 'None'}

Create some memories using the create_memory tool to get started!`
            }]
          };
        }

        // Sort memories by creation date (newest first)
        const sortedMemories = memories.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        const memoryList = sortedMemories.map((memory, index) => {
          return `**${index + 1}. ${memory.id}**
Content: ${memory.content.substring(0, 150)}${memory.content.length > 150 ? '...' : ''}
Agent: ${memory.agentId || 'Not specified'} | Category: ${memory.category || 'Not specified'} | Importance: ${memory.importance || 'Not specified'}
Created: ${new Date(memory.createdAt).toLocaleString()}`;
        }).join('\n\n');

        // Get statistics
        const stats = await storage.getStatistics();

        return {
          content: [{
            type: 'text' as const,
            text: `📝 Found ${memories.length} memory(ies):

**Filters:** ${[
              agentId && `Agent: ${agentId}`,
              category && `Category: ${category}`
            ].filter(Boolean).join(', ') || 'None'}
**Limit:** ${limit}

${memoryList}

---

**📊 Overall Statistics:**
• Total memories: ${stats.totalMemories}
• Agents: ${Object.keys(stats.memoriesByAgent).length}
• Categories: ${Object.keys(stats.memoriesByCategory).length}
• Oldest memory: ${stats.oldestMemory ? new Date(stats.oldestMemory).toLocaleString() : 'None'}
• Newest memory: ${stats.newestMemory ? new Date(stats.newestMemory).toLocaleString() : 'None'}

Use get_memory with a specific ID to see full details, or search_memories for semantic search.`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error listing memories: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  };
}
