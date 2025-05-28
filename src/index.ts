#!/usr/bin/env node

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { getVersionString } from './utils/version.js';

/**
 * Main entry point for the MCP task management server
 * Uses STDIO transport for communication with MCP clients
 */
async function main() {
  try {
    // Create the MCP server
    const server = await createServer();

    // Create STDIO transport
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    // Log server start (to stderr so it doesn't interfere with MCP communication)
    console.error(`🚀 Agentic Tools MCP Server ${getVersionString()} started successfully`);
    console.error('📋 Task Management features available:');
    console.error('   • Project Management (list, create, get, update, delete)');
    console.error('   • Task Management (list, create, get, update, delete)');
    console.error('   • Subtask Management (list, create, get, update, delete)');
    console.error('');
    console.error('🧠 Agent Memories features available:');
    console.error('   • Memory Management (create, search, get, list, update, delete)');
    console.error('   • Intelligent multi-field text search with relevance scoring');
    console.error('   • JSON file storage with title/content architecture');
    console.error('');
    console.error('💡 Use list_projects to get started with tasks, or create_memory for memories!');
  } catch (error) {
    console.error('❌ Failed to start MCP server:', error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('\n👋 Shutting down MCP server...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('\n👋 Shutting down MCP server...');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});
