import { z } from 'zod';
import { MemoryStorage } from '../../storage/storage.js';

/**
 * Search memories by semantic similarity
 *
 * @param storage - Memory storage instance
 * @returns MCP tool handler for searching memories
 */
const MEMORY_CONTENT_MAX_LENGTH = 300;

export function createSearchMemoriesTool(storage: MemoryStorage) {
  return {
    name: 'search_memories',
    description: 'Search memories by text content matching',
    inputSchema: {
      query: z.string(),
      limit: z.number().min(1).max(100).optional(),
      threshold: z.number().min(0).max(1).optional(),
      category: z.string().optional()
    },
    handler: async ({
      query,
      limit = 10,
      threshold,
      category
    }: {
      query: string;
      limit?: number;
      threshold?: number;
      category?: string;
    }) => {
      try {
        // Validate inputs
        const errorMsg = validateInput({ query, limit, threshold });
        if (errorMsg) {
          return {
            content: [{
              type: 'text' as const,
              text: errorMsg
            }],
            isError: true
          };
}

/** Shared formatting helpers to avoid code duplication */
function formatHeader(count: number) {
  return [
    `# 🔍 Found ${count} memory(ies):`,
    '',
    '---',
    ''
  ].join('\n');
}

function formatFilters(query: string, threshold: number, category?: string) {
  return [
    '## Filters & Limit',
    '',
    `**Query:** "${query}"  `,
    `**Threshold:** ${threshold}  `,
    `**Filters:** ${category ? `Category: ${category}` : 'None'}`,
    '',
    '---',
    ''
  ].join('\n');
}

function formatNote() {
  return [
    '**Note:**  ',
    'The symbol "⋯📄" in content indicates truncated or incomplete data. Use get_memory with a specific ID to see full details, or search_memories for text-based search.',
    ''
  ].join('\n');
}

/** Validate input and return error message if invalid */
function validateInput({ query, limit, threshold }: { query: string; limit: number; threshold?: number }) {
  if (!query || query.trim().length === 0) return 'Error: Search query is required.';
  if (query.trim().length > 1000) return 'Error: Search query must be 1000 characters or less.';
  if (limit < 1 || limit > 100) return 'Error: Limit must be between 1 and 100.';
  if (threshold !== undefined && (threshold < 0 || threshold > 1)) return 'Error: Threshold must be between 0 and 1.';
  return null;
}

/** Get actual threshold value */
function getActualThreshold(threshold: number | undefined, storage: MemoryStorage) {
  return threshold ?? (storage as any).config?.defaultThreshold ?? 0.3;
}

/** Format memory list block */
function formatMemoryList(results: any[]) {
  const memoryBlocks = results.map((result: any, index: number) => formatMemory(result, index));
  return [
    '',
    '## Memory List',
    '',
    memoryBlocks.join('\n\n')
  ].join('\n');
}

/** Format single memory block */
function formatMemory(result: any, index: number) {
  const memory = result.memory;
  const truncated = memory.content.length > MEMORY_CONTENT_MAX_LENGTH;
  const contentBlock = `\`\`\`markdown
${memory.content.substring(0, MEMORY_CONTENT_MAX_LENGTH)}${truncated ? '⋯📄' : ''}
\`\`\``;
  return [
    `### Memory ${index + 1}`,
    `**Memory ID:** ${memory.id}  `,
    `**Relevance Score:** ${(result.score * 100).toFixed(1)}%`,
    '',
    `Content:  `,
    contentBlock,
    `**Category:** ${memory.category || 'Not specified'}  `,
    `**Created:** ${new Date(memory.createdAt).toLocaleString()}  `,
    `**Metadata:** ${memory.metadata && Object.keys(memory.metadata).length > 0 ? JSON.stringify(memory.metadata, null, 2) : 'None'}`,
    '',
    '---'
  ].join('\n');
}

        const searchInput = {
          query: query.trim(),
          limit,
          threshold, // Will use config default if undefined
          category: category?.trim()
        };

        const results = await storage.searchMemories(searchInput);

        // Get the actual threshold used (from config if not provided)
        const actualThreshold = getActualThreshold(threshold, storage);

        if (results.length === 0) {
          const outputText = [
            formatHeader(0),
            formatFilters(query, actualThreshold, category),
            formatNote()
          ].join('\n');
          return {
            content: [{
              type: 'text' as const,
              text: outputText
            }]
          };
        }

        // --- Compose output ---
        const outputText = [
          formatHeader(results.length),
          formatFilters(query, actualThreshold, category),
          formatMemoryList(results),
          formatNote()
        ].join('\n');

        return {
          content: [{
            type: 'text' as const,
            text: outputText
          }]
        };
      } catch (error) {
        return {
          content: [{
            type: 'text' as const,
            text: `Error searching memories: ${error instanceof Error ? error.message : 'Unknown error'}`
          }],
          isError: true
        };
      }
    }
  };
}
