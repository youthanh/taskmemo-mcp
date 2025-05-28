# Agentic Tools MCP Server

A comprehensive Model Context Protocol (MCP) server for task management, providing AI assistants with powerful project, task, and subtask management capabilities with **project-specific storage**.

## Features

### 🎯 Complete Task Management System
- **Projects**: Organize work into distinct projects with descriptions
- **Tasks**: Break down projects into manageable tasks
- **Subtasks**: Further decompose tasks into actionable subtasks
- **Hierarchical Organization**: Projects → Tasks → Subtasks
- **Progress Tracking**: Monitor completion status at all levels
- **Project-Specific Storage**: Each working directory has isolated task data
- **Git-Trackable**: Task data can be committed alongside your code

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

**Important**: All tools require a `workingDirectory` parameter to specify where the task data should be stored. This enables project-specific task management.

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
    "task-management": {
      "command": "npx",
      "args": ["-y", "@pimzino/agentic-tools-mcp"]
    }
  }
}
```

### With AugmentCode
1. Open Augment Settings Panel (gear icon)
2. Add MCP server:
   - **Name**: `task-management`
   - **Command**: `npx -y @pimzino/agentic-tools-mcp`
3. Restart VS Code

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

## Data Storage

- **Project-specific**: Each working directory has its own isolated task data
- **File-based**: Data is stored in `.agentic-tools-mcp/tasks.json` within each working directory
- **Git-trackable**: Task data can be committed alongside your project code
- **Persistent**: All data persists between server restarts
- **Atomic**: All operations are atomic to prevent data corruption
- **Backup-friendly**: Simple JSON format for easy backup and migration

### Storage Structure
```
your-project/
├── .agentic-tools-mcp/
│   └── tasks.json          # Task management data for this project
├── src/
├── package.json
└── README.md
```

### Working Directory Parameter
All MCP tools require a `workingDirectory` parameter that specifies:
- Where to store the `.agentic-tools-mcp/` folder
- Which project's task data to access
- Enables multiple projects to have separate task lists

### Benefits of Project-Specific Storage
- **Git Integration**: Task data can be committed with your code
- **Team Collaboration**: Share task lists via version control
- **Project Isolation**: Each project has its own task management
- **Multi-Project Workflow**: Work on multiple projects simultaneously
- **Backup & Migration**: Simple file-based storage travels with your code

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
├── features/task-management/
│   ├── tools/           # MCP tool implementations
│   │   ├── projects/    # Project CRUD operations
│   │   ├── tasks/       # Task CRUD operations
│   │   └── subtasks/    # Subtask CRUD operations
│   ├── models/          # TypeScript interfaces
│   └── storage/         # Data persistence layer
├── server.ts            # MCP server configuration
└── index.ts             # Entry point
```

## Troubleshooting

### Common Issues

**"Working directory does not exist"**
- Ensure the path exists and is accessible
- Use absolute paths for reliability
- Check directory permissions


## License

MIT License - see LICENSE file for details.

## Contributing

Contributions are welcome! Please feel free to submit issues and pull requests.

## Support

For issues and questions, please use the GitHub issue tracker.
