import { z } from 'zod';
import { MemoryStorage } from '../../storage/storage.js';

/**
 * Update an existing memory
 *
 * @param storage - Memory storage instance
 * @returns MCP tool handler for updating memories
 */
export function createUpdateMemoryTool(storage: MemoryStorage) {
  return {
    name: 'update_memory',
    description: 'Update an existing memory by ID',
    inputSchema: {
      id: z.string(),
      content: z.string().optional(),
      metadata: z.record(z.any()).optional(),
      category: z.string().optional(),
      importance: z.number().min(1).max(10).optional()
    },
    handler: async ({ 
      id, 
      content, 
      metadata, 
      category, 
      importance 
    }: { 
      id: string; 
      content?: string; 
      metadata?: Record<string, any>; 
      category?: string; 
      importance?: number; 
    }) => {
      try {
        // Validate inputs
        if (!id || id.trim().length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Memory ID is required.'
            }],
            isError: true
          };
        }

        if (content !== undefined && content.trim().length === 0) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Content cannot be empty if provided.'
            }],
            isError: true
          };
        }

        if (content && content.trim().length > 10000) {
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

        if (category && category.trim().length > 100) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: Category must be 100 characters or less.'
            }],
            isError: true
          };
        }

        // Check if at least one field is being updated
        if (content === undefined && metadata === undefined && category === undefined && importance === undefined) {
          return {
            content: [{
              type: 'text' as const,
              text: 'Error: At least one field (content, metadata, category, or importance) must be provided for update.'
            }],
            isError: true
          };
        }

        // Get the existing memory first
        const existingMemory = await storage.getMemory(id.trim());
        if (!existingMemory) {
          return {
            content: [{
              type: 'text' as const,
              text: `❌ Memory not found.

**Memory ID:** ${id}

The memory with this ID does not exist or may have been deleted.`
            }],
            isError: true
          };
        }

        // Prepare updates
        const updates: any = {};
        if (content !== undefined) {
          updates.content = content.trim();
        }
        if (metadata !== undefined) {
          updates.metadata = metadata;
        }
        if (category !== undefined) {
          updates.category = category.trim();
        }
        if (importance !== undefined) {
          updates.importance = importance;
        }

        const updatedMemory = await storage.updateMemory(id.trim(), updates);

        if (!updatedMemory) {
          return {
            content: [{
              type: 'text' as const,
              text: `❌ Failed to update memory.

**Memory ID:** ${id}

The memory could not be updated. Please try again.`
            }],
            isError: true
          };
        }

        // Show what changed
        const changes: string[] = [];
        if (content !== undefined && content.trim() !== existingMemory.content) {
          changes.push('Content');
        }
        if (metadata !== undefined && JSON.stringify(metadata) !== JSON.stringify(existingMemory.metadata)) {
          changes.push('Metadata');
        }
        if (category !== undefined && category.trim() !== existingMemory.category) {
          changes.push('Category');
        }
        if (importance !== undefined && importance !== existingMemory.importance) {
          changes.push('Importance');
        }

        return {
          content: [{
            type: 'text' as const,
            text: `✅ Memory updated successfully!

**Memory ID:** ${updatedMemory.id}
**Updated Fields:** ${changes.join(', ')}
**Content:** ${updatedMemory.content.substring(0, 200)}${updatedMemory.content.length > 200 ? '...' : ''}
**Agent ID:** ${updatedMemory.agentId || 'Not specified'}
**Category:** ${updatedMemory.category || 'Not specified'}
**Importance:** ${updatedMemory.importance || 'Not specified'}
**Created:** ${new Date(updatedMemory.createdAt).toLocaleString()}
**Updated:** ${new Date(updatedMemory.updatedAt).toLocaleString()}
**Metadata:** ${Object.keys(updatedMemory.metadata).length > 0 ? JSON.stringify(updatedMemory.metadata, null, 2) : 'None'}

${content !== undefined ? 'The embedding has been regenerated for the updated content.' : ''}`
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error updating memory: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  };
}
