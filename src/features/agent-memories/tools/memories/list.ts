import { z } from 'zod';
import { MemoryStorage } from '../../storage/storage.js';

/**
 * List memories with optional filtering
 *
 * @param storage - Memory storage instance
 * @returns MCP tool handler for listing memories
 */
const MEMORY_LIST_MAX_LIMIT = 1000;
const MEMORY_CONTENT_MAX_LENGTH = 500;

export function createListMemoriesTool(storage: MemoryStorage) {
  return {
    name: 'list_memories',
    description: 'List memories with optional filtering by category and limit',
    inputSchema: {
      category: z.string().optional(),
      limit: z.number().min(1).max(MEMORY_LIST_MAX_LIMIT).optional()
    },
    handler: async ({ category, limit = 50 }: { category?: string; limit?: number }) => {
      try {
        // Validate input
        if (!isValidLimit(limit)) return errorResult('Limit must be between 1 and 1000.');
        if (!isValidCategory(category)) return errorResult('Category must be 100 characters or less.');

        const memories = await storage.getMemories(undefined, category?.trim(), limit);
        if (memories.length === 0) return noMemoriesResult(category);

        const sortedMemories = sortMemoriesByDate(memories);
        const memoryList = formatMemoryList(sortedMemories);
        const stats = await storage.getStatistics();

        return {
          content: [{
            type: 'text' as const,
            text: [
              formatHeader(memories.length),
              formatFilters(category, limit),
              memoryList,
              formatStatistics(stats),
              formatNote()
            ].join('\n')
          }]
        };
      } catch (error) {
        return errorResult(`Error listing memories: ${error instanceof Error ? error.message : 'Unknown error'}`);
}

// --- Helper functions ---

function isValidLimit(limit: number) {
  return limit >= 1 && limit <= MEMORY_LIST_MAX_LIMIT;
}

function isValidCategory(category?: string) {
  return !category || category.trim().length <= 100;
}

function errorResult(text: string) {
  return {
    content: [{
      type: 'text' as const,
      text
    }],
    isError: true
  };
}

function noMemoriesResult(category?: string) {
  return {
    content: [{
      type: 'text' as const,
      text: `📝 No memories found.

**Filters:** ${category ? `Category: ${category}` : 'None'}

Create some memories using the create_memory tool to get started!`
    }]
  };
}

function sortMemoriesByDate(memories: any[]) {
  return memories.sort((a, b) =>
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

function formatMemoryList(memories: any[]) {
  const memoryBlocks = memories.map((memory, index) => formatMemory(memory, index));
  return [
    '',
    '## Memory List',
    '',
    memoryBlocks.join('\n\n')
  ].join('\n');
}

function formatMemory(memory: any, index: number) {
  const truncated = memory.content.length > MEMORY_CONTENT_MAX_LENGTH;
  const contentBlock = `\`\`\`md
${memory.content.substring(0, MEMORY_CONTENT_MAX_LENGTH)}${truncated ? '⋯📄' : ''}
\`\`\``;
  return [
    `### Memory ${index + 1}: ${memory.title}`,
    `**ID:** ${memory.id}`,
    '',
    `Content:`,
    contentBlock,
    `Category: ${memory.category || 'Not specified'}`,
    `Created: ${new Date(memory.createdAt).toLocaleString()}`,
    '',
    '---'
  ].join('\n');
}

function formatHeader(count: number) {
  return [
    `# 📝 Found ${count} memory(ies):`,
    '',
    '---',
    ''
  ].join('\n');
}

function formatFilters(category?: string, limit?: number) {
  return [
    '## Filters & Limit',
    '',
    `**Filters:** ${category ? `Category: ${category}` : 'None'}`,
    `**Limit:** ${limit}`,
    '',
    '---',
    ''
  ].join('\n');
}

function formatStatistics(stats: any) {
  return [
    '',
    '## 📊 Overall Statistics',
    '',
    `• Total memories: ${stats.totalMemories}`,
    `• Categories: ${Object.keys(stats.memoriesByCategory).length}`,
    `• Oldest memory: ${stats.oldestMemory ? new Date(stats.oldestMemory).toLocaleString() : 'None'}`,
    `• Newest memory: ${stats.newestMemory ? new Date(stats.newestMemory).toLocaleString() : 'None'}`,
    '',
    '---',
    ''
  ].join('\n');
}

function formatNote() {
  return [
    '**Note:**',
    'The symbol "⋯📄" in content indicates truncated or incomplete data. Use get_memory with a specific ID to see full details, or search_memories for text-based search.',
    ''
  ].join('\n');
}
    }
  };
}