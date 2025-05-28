# Quick Start: Agent Memories

Get started with the Agent Memories feature in just a few minutes!

## Prerequisites

- Node.js 18+ installed
- Agentic Tools MCP Server v1.2.0+
- MCP-compatible client (Claude Desktop, AugmentCode, etc.)

## Installation

```bash
# Install or update to latest version
npx -y @pimzino/agentic-tools-mcp
```

## Basic Usage

### 1. Create Your First Memory

```javascript
// Create a memory about user preferences
await create_memory({
  workingDirectory: "/path/to/your/project",
  content: "User prefers concise responses and technical explanations",
  agentId: "assistant-1",
  category: "user_preferences",
  importance: 8,
  metadata: {
    source: "conversation",
    confidence: 0.9
  }
});
```

### 2. Search Memories

```javascript
// Search for memories about user preferences
await search_memories_Agentic_Tools({
  workingDirectory: "/path/to/your/project",
  query: "how does the user like responses",
  limit: 5,
  threshold: 0.3
});
```

### 3. List All Memories

```javascript
// List all memories for a specific agent
await list_memories_Agentic_Tools({
  workingDirectory: "/path/to/your/project",
  agentId: "assistant-1",
  limit: 20
});
```

### 4. Update a Memory

```javascript
// Update an existing memory
await update_memory_Agentic_Tools({
  workingDirectory: "/path/to/your/project",
  id: "memory-id-here",
  content: "Updated memory content",
  importance: 9
});
```

### 5. Delete a Memory

```javascript
// Delete a memory (requires confirmation)
await delete_memory_Agentic_Tools({
  workingDirectory: "/path/to/your/project",
  id: "memory-id-here",
  confirm: true
});
```

## Common Use Cases

### User Preferences
```javascript
await create_memory_Agentic_Tools({
  workingDirectory: "/my/project",
  content: "User prefers dark mode and minimal UI",
  category: "preferences",
  importance: 8
});
```

### Project Context
```javascript
await create_memory_Agentic_Tools({
  workingDirectory: "/my/project",
  content: "This is a React TypeScript project with strict ESLint rules",
  category: "technical",
  importance: 7,
  metadata: { framework: "React", language: "TypeScript" }
});
```

### Conversation History
```javascript
await create_memory_Agentic_Tools({
  workingDirectory: "/my/project",
  content: "User mentioned they work in healthcare and need HIPAA compliance",
  category: "context",
  importance: 9,
  metadata: { industry: "healthcare", compliance: "HIPAA" }
});
```

## Search Examples

### Semantic Search
```javascript
// Find memories related to user interface
const results = await search_memories_Agentic_Tools({
  workingDirectory: "/my/project",
  query: "user interface design preferences",
  threshold: 0.8
});
```

### Filtered Search
```javascript
// Search within a specific category
const results = await search_memories_Agentic_Tools({
  workingDirectory: "/my/project",
  query: "coding standards",
  category: "technical",
  minImportance: 7
});
```

## Tips for Better Results

### 1. Write Clear Content
```javascript
// Good: Specific and descriptive
content: "User prefers TypeScript over JavaScript for better type safety"

// Avoid: Vague or unclear
content: "User likes TS"
```

### 2. Use Consistent Categories
```javascript
// Recommended categories:
- "preferences"     // User preferences and settings
- "technical"       // Technical requirements and constraints
- "context"         // Conversation context and background
- "project"         // Project-specific information
- "personal"        // Personal information about the user
```

### 3. Set Appropriate Importance
```javascript
// 9-10: Critical information (security, compliance, core preferences)
// 7-8:  Important context (technical requirements, key preferences)
// 5-6:  Useful information (project details, minor preferences)
// 1-4:  Nice to have (temporary notes, low-priority context)
```

### 4. Include Useful Metadata
```javascript
metadata: {
  source: "conversation",      // Where this memory came from
  confidence: 0.9,            // How confident you are (0-1)
  timestamp: "2024-01-15",    // When this was relevant
  tags: ["ui", "design"]      // Additional tags for organization
}
```

## Storage Location

Memories are stored in your project directory:
```
your-project/
├── .agentic-tools-mcp/
│   ├── tasks/              # Task management data
│   │   └── tasks.json      # Projects, tasks, and subtasks data
│   └── memories/           # LanceDB vector database
│       ├── data/
│       └── metadata/
├── src/
└── package.json
```

## Next Steps

1. **Read the Full Documentation**: Check out `docs/AGENT_MEMORIES.md` for complete details
2. **Experiment with Search**: Try different similarity thresholds to find what works best
3. **Organize with Categories**: Develop a consistent categorization system
4. **Use with Tasks**: Combine memories with task management for comprehensive project context
5. **Monitor Performance**: Use the statistics features to understand your memory usage

## Need Help?

- 📖 Full documentation: `docs/AGENT_MEMORIES.md`
- 🐛 Report issues: GitHub issue tracker
- 💡 Feature requests: GitHub discussions
- 📋 Version history: `CHANGELOG.md`

Happy memory management! 🧠✨
