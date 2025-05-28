# Agentic Tools MCP Server

A comprehensive Model Context Protocol (MCP) server providing AI assistants with powerful **task management** and **agent memories** capabilities with **project-specific storage**.

## Features

### 🎯 Complete Task Management System
- **Projects**: Organize work into distinct projects with descriptions
- **Tasks**: Break down projects into manageable tasks
- **Subtasks**: Further decompose tasks into actionable subtasks
- **Hierarchical Organization**: Projects → Tasks → Subtasks
- **Progress Tracking**: Monitor completion status at all levels
- **Project-Specific Storage**: Each working directory has isolated task data
- **Git-Trackable**: Task data can be committed alongside your code

### 🧠 Agent Memories System
- **Persistent Memory**: Store and retrieve agent memories with semantic content
- **Vector Search**: LanceDB-powered semantic similarity search
- **Smart Organization**: Categorize memories by agent, category, and importance
- **Rich Metadata**: Flexible metadata system for enhanced context
- **Auto-Embedding**: Automatic vector generation for semantic search
- **Project-Specific**: Isolated memory storage per working directory

### 🔧 MCP Tools Available

#### Project Management
- `list_projects` - View all projects in a working directory
- `create_project` - Create a new project in a working directory
- `get_project` - Get detailed project information
- `update_project` - Edit project name/description
- `delete_project` - Delete project and all associated data

#### Task Management
- `list_tasks` - View tasks (optionally filtered by project)
- `create_task` - Create a new task within a project
- `get_task` - Get detailed task information
- `update_task` - Edit task details or mark as completed
- `delete_task` - Delete task and all associated subtasks

#### Subtask Management
- `list_subtasks` - View subtasks (filtered by task or project)
- `create_subtask` - Create a new subtask within a task
- `get_subtask` - Get detailed subtask information
- `update_subtask` - Edit subtask details or mark as completed
- `delete_subtask` - Delete a specific subtask

#### Agent Memory Management
- `create_memory_Agentic_Tools` - Create a new memory with automatic embedding
- `search_memories_Agentic_Tools` - Search memories using semantic similarity
- `get_memory_Agentic_Tools` - Get detailed memory information
- `list_memories_Agentic_Tools` - List memories with optional filtering
- `update_memory_Agentic_Tools` - Edit memory content, metadata, or categorization
- `delete_memory_Agentic_Tools` - Delete a memory (requires confirmation)

**Important**: All tools require a `workingDirectory` parameter to specify where the data should be stored. This enables project-specific task and memory management.

## Installation

### Quick Start
```bash
npx -y @pimzino/agentic-tools-mcp
```

### Global Installation
```bash
npm install -g @pimzino/agentic-tools-mcp
```

## Usage

### With Claude Desktop
Add to your Claude Desktop configuration:

```json
{
  "mcpServers": {
    "agentic-tools": {
      "command": "npx",
      "args": ["-y", "@pimzino/agentic-tools-mcp"]
    }
  }
}
```

**Note**: The server now includes both task management and agent memories features.

### With AugmentCode
1. Open Augment Settings Panel (gear icon)
2. Add MCP server:
   - **Name**: `agentic-tools`
   - **Command**: `npx -y @pimzino/agentic-tools-mcp`
3. Restart VS Code

**Features Available**: Task management, agent memories, and vector search capabilities.

### With Other MCP Clients
The server uses STDIO transport and can be integrated with any MCP-compatible client:

```bash
npx -y @pimzino/agentic-tools-mcp
```

## Data Models

### Project
```typescript
{
  id: string;           // Unique identifier
  name: string;         // Project name
  description: string;  // Project overview
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}
```

### Task
```typescript
{
  id: string;           // Unique identifier
  name: string;         // Task name
  details: string;      // Enhanced description
  projectId: string;    // Parent project reference
  completed: boolean;   // Completion status
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}
```

### Subtask
```typescript
{
  id: string;           // Unique identifier
  name: string;         // Subtask name
  details: string;      // Enhanced description
  taskId: string;       // Parent task reference
  projectId: string;    // Parent project reference
  completed: boolean;   // Completion status
  createdAt: string;    // ISO timestamp
  updatedAt: string;    // ISO timestamp
}
```

### Memory
```typescript
{
  id: string;                    // Unique identifier
  content: string;               // Memory content/text
  embedding?: number[];          // Vector representation (auto-generated)
  metadata: Record<string, any>; // Flexible metadata object
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
  agentId?: string;             // Optional agent identifier
  category?: string;            // Optional categorization
  importance?: number;          // Optional importance score (1-10)
}
```

## Example Workflow

1. **Create a Project**
   ```
   Use create_project with:
   - workingDirectory="/path/to/your/project"
   - name="Website Redesign"
   - description="Complete overhaul of company website"
   ```

2. **Add Tasks**
   ```
   Use create_task with:
   - workingDirectory="/path/to/your/project"
   - name="Design mockups"
   - details="Create wireframes and high-fidelity designs"
   - projectId="[project-id-from-step-1]"
   ```

3. **Break Down Tasks**
   ```
   Use create_subtask with:
   - workingDirectory="/path/to/your/project"
   - name="Create wireframes"
   - details="Sketch basic layout structure"
   - taskId="[task-id-from-step-2]"
   ```

4. **Track Progress**
   ```
   Use update_task and update_subtask to mark items as completed
   Use list_projects, list_tasks, and list_subtasks to view progress
   (All with workingDirectory parameter)
   ```

### Agent Memories Workflow

1. **Create a Memory**
   ```
   Use create_memory_Agentic_Tools with:
   - workingDirectory="/path/to/your/project"
   - content="User prefers concise responses and technical explanations"
   - metadata={"source": "conversation", "confidence": 0.9}
   - agentId="assistant-1"
   - category="user_preferences"
   - importance=9
   ```

2. **Search Memories**
   ```
   Use search_memories_Agentic_Tools with:
   - workingDirectory="/path/to/your/project"
   - query="how does the user like responses"
   - limit=5
   - threshold=0.8
   - category="user_preferences"
   ```

3. **List and Manage**
   ```
   Use list_memories_Agentic_Tools to view all memories
   Use update_memory_Agentic_Tools to modify existing memories
   Use delete_memory_Agentic_Tools to remove outdated memories
   (All with workingDirectory parameter)
   ```

**📖 Quick Start**: See [docs/QUICK_START_MEMORIES.md](docs/QUICK_START_MEMORIES.md) for a step-by-step guide to agent memories.

## Data Storage

- **Project-specific**: Each working directory has its own isolated task and memory data
- **File-based**: Task data stored in `.agentic-tools-mcp/tasks.json`, memory data in `.agentic-tools-mcp/memories/`
- **Git-trackable**: All data can be committed alongside your project code
- **Persistent**: All data persists between server restarts
- **Atomic**: All operations are atomic to prevent data corruption
- **Vector Database**: LanceDB for efficient semantic search of memories
- **Backup-friendly**: Simple file-based storage for easy backup and migration

### Storage Structure
```
your-project/
├── .agentic-tools-mcp/
│   ├── tasks.json          # Task management data for this project
│   └── memories/           # LanceDB vector database for memories
│       ├── data/
│       └── metadata/
├── src/
├── package.json
└── README.md
```

### Working Directory Parameter
All MCP tools require a `workingDirectory` parameter that specifies:
- Where to store the `.agentic-tools-mcp/` folder
- Which project's task and memory data to access
- Enables multiple projects to have separate task lists and memory stores

### Benefits of Project-Specific Storage
- **Git Integration**: Task and memory data can be committed with your code
- **Team Collaboration**: Share task lists and agent memories via version control
- **Project Isolation**: Each project has its own task management and memory system
- **Multi-Project Workflow**: Work on multiple projects simultaneously with isolated memories
- **Backup & Migration**: File-based storage travels with your code
- **Semantic Search**: Vector-based memory search for intelligent context retrieval
- **Agent Continuity**: Persistent agent memories across sessions and deployments

## Error Handling

- **Validation**: All inputs are validated with comprehensive error messages
- **Directory Validation**: Ensures working directory exists and is accessible
- **Referential Integrity**: Prevents orphaned tasks/subtasks with cascade deletes
- **Unique Names**: Enforces unique names within scope (project/task)
- **Confirmation**: Destructive operations require explicit confirmation
- **Graceful Degradation**: Detailed error messages for troubleshooting
- **Storage Errors**: Clear messages when storage initialization fails

## Development

### Building from Source
```bash
git clone <repository>
cd agentic-tools-mcp
npm install
npm run build
npm start
```

### Project Structure
```
src/
├── features/
│   ├── task-management/
│   │   ├── tools/           # MCP tool implementations
│   │   │   ├── projects/    # Project CRUD operations
│   │   │   ├── tasks/       # Task CRUD operations
│   │   │   └── subtasks/    # Subtask CRUD operations
│   │   ├── models/          # TypeScript interfaces
│   │   └── storage/         # Data persistence layer
│   └── agent-memories/
│       ├── tools/           # Memory MCP tool implementations
│       │   └── memories/    # Memory CRUD operations
│       ├── models/          # Memory TypeScript interfaces
│       └── storage/         # LanceDB storage implementation
├── server.ts            # MCP server configuration
└── index.ts             # Entry point
```

## Troubleshooting

### Common Issues

**"Working directory does not exist"**
- Ensure the path exists and is accessible
- Use absolute paths for reliability
- Check directory permissions

**"Vector search returns no results"** (Agent Memories)
- Lower the similarity threshold (try 0.5 or 0.3)
- Check that embeddings are being generated correctly
- Verify that the query content is meaningful

**"Database not initialized"** (Agent Memories)
- Ensure the working directory exists and is writable
- Check LanceDB installation and compatibility

## Version History

See [CHANGELOG.md](CHANGELOG.md) for detailed version history and release notes.

### Current Version: 1.3.0
- ✅ Complete task management system
- ✅ Agent memories with vector search
- ✅ LanceDB integration
- ✅ Project-specific storage
- ✅ Comprehensive MCP tools

## Acknowledgments

We're grateful to the open-source community and the following projects that make this MCP server possible:

### Core Technologies
- **[@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk)** - The foundation for MCP server implementation
- **[LanceDB](https://lancedb.github.io/lancedb/)** - High-performance vector database for semantic search
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript development
- **[Node.js](https://nodejs.org/)** - JavaScript runtime environment

### Development & Validation
- **[Zod](https://zod.dev/)** - TypeScript-first schema validation for robust input handling
- **[ESLint](https://eslint.org/)** - Code quality and consistency
- **[Prettier](https://prettier.io/)** - Code formatting

### Vector Database & AI
- **[Apache Arrow](https://arrow.apache.org/)** - Columnar in-memory analytics (used by LanceDB)
- **Vector Search Technology** - Enabling semantic similarity search for agent memories

### Special Thanks
- **Open Source Community** - For creating the tools and libraries that make this project possible

## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

### Development Setup
```bash
git clone <repository>
cd agentic-tools-mcp
npm install
npm run build
npm start
```

## Support

For issues and questions, please use the GitHub issue tracker.

### Documentation
- 📖 **[API Reference](docs/API_REFERENCE.md)** - Complete tool documentation
- 🧠 **[Agent Memories Guide](docs/AGENT_MEMORIES.md)** - Comprehensive memory system guide
- 🚀 **[Quick Start: Memories](docs/QUICK_START_MEMORIES.md)** - Get started with agent memories
- 📋 **[Changelog](CHANGELOG.md)** - Version history and release notes

### Getting Help
- 🐛 Report bugs via GitHub issues
- 💡 Request features via GitHub discussions
