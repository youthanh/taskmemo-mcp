# Agent Memories Feature

The Agent Memories feature provides a comprehensive memory system for AI agents using LanceDB vector database. It enables persistent storage, semantic search, and CRUD operations for agent memories with vector-based similarity search capabilities.

## Overview

The agent memories system allows AI agents to:
- Store and retrieve memories with semantic content
- Perform vector-based similarity searches using LanceDB
- Organize memories by agent, category, and importance
- Maintain persistent storage across sessions with project isolation
- Access rich metadata and timestamps
- Automatically generate embeddings for semantic search
- Filter and search memories with flexible criteria

## Architecture

The agent memories module follows the same modular architecture as the task management system:

```
src/features/agent-memories/
├── models/           # TypeScript interfaces and types
├── storage/          # Storage interfaces and LanceDB implementation
└── tools/           # MCP tool implementations
```

## Data Model

### Memory Interface

```typescript
interface Memory {
  id: string;                    // Unique identifier
  content: string;               // The actual memory content/text
  embedding?: number[];          // Vector representation (auto-generated)
  metadata: Record<string, any>; // Flexible metadata object
  createdAt: string;            // ISO timestamp
  updatedAt: string;            // ISO timestamp
  agentId?: string;             // Optional agent identifier
  category?: string;            // Optional categorization
  importance?: number;          // Optional importance score (1-10)
}
```

## Storage

- **Database**: LanceDB vector database (v0.19.1)
- **Location**: `{workingDirectory}/.agentic-tools-mcp/memories/`
- **Format**: Local file-based storage with vector indexing
- **Schema**: Optimized for vector search with "vector" column for embeddings
- **Embedding**: Automatic embedding generation using local embedding function
- **Isolation**: Project-specific storage per working directory
- **Performance**: Efficient vector similarity search with configurable thresholds
- **Persistence**: All data persists across server restarts

## MCP Tools

### 1. create_memory

Creates a new memory with automatic embedding generation.

**Parameters:**
- `workingDirectory` (string): Project working directory
- `content` (string): Memory content text
- `metadata` (object, optional): Additional metadata
- `agentId` (string, optional): Agent identifier
- `category` (string, optional): Memory category
- `importance` (number, optional): Importance score (1-10)
- `embedding` (number[], optional): Pre-computed embedding vector

**Example:**
```json
{
  "workingDirectory": "/path/to/project",
  "content": "User prefers dark mode interface",
  "metadata": {"source": "user_preference", "confidence": 0.9},
  "agentId": "assistant-1",
  "category": "preferences",
  "importance": 8
}
```

### 2. search_memories_Agentic_Tools

Searches memories using semantic similarity.

**Parameters:**
- `workingDirectory` (string): Project working directory
- `query` (string): Search query text
- `limit` (number, optional): Maximum results (default: 10, max: 100)
- `threshold` (number, optional): Similarity threshold (default: 0.7, range: 0-1)
- `agentId` (string, optional): Filter by agent ID
- `category` (string, optional): Filter by category
- `minImportance` (number, optional): Minimum importance filter

**Example:**
```json
{
  "workingDirectory": "/path/to/project",
  "query": "user interface preferences",
  "limit": 5,
  "threshold": 0.8,
  "category": "preferences"
}
```

### 3. get_memory_Agentic_Tools

Retrieves a specific memory by ID.

**Parameters:**
- `workingDirectory` (string): Project working directory
- `id` (string): Memory ID

### 4. list_memories_Agentic_Tools

Lists memories with optional filtering.

**Parameters:**
- `workingDirectory` (string): Project working directory
- `agentId` (string, optional): Filter by agent ID
- `category` (string, optional): Filter by category
- `limit` (number, optional): Maximum results (default: 50, max: 1000)

### 5. update_memory_Agentic_Tools

Updates an existing memory.

**Parameters:**
- `workingDirectory` (string): Project working directory
- `id` (string): Memory ID
- `content` (string, optional): Updated content
- `metadata` (object, optional): Updated metadata
- `category` (string, optional): Updated category
- `importance` (number, optional): Updated importance

### 6. delete_memory_Agentic_Tools

Deletes a memory (requires confirmation).

**Parameters:**
- `workingDirectory` (string): Project working directory
- `id` (string): Memory ID
- `confirm` (boolean): Confirmation flag

## Configuration

The memory system uses the following default configuration:

```typescript
{
  embeddingDimension: 200,     // Vector dimension (optimized for TF-IDF + SVD)
  defaultThreshold: 0.3,       // Default similarity threshold (0-1)
  defaultLimit: 10,            // Default search limit
  autoEmbedding: true          // Auto-generate embeddings from content
}
```

### Embedding Strategy

The current implementation uses a simple local embedding function that:
- Generates 384-dimensional vectors for efficient storage and search
- Processes text using word-based hashing and normalization
- Provides consistent embeddings for identical content
- Runs locally without external API dependencies
- Can be easily replaced with more sophisticated embedding models

**Note**: For production use, consider integrating with advanced embedding models like:
- OpenAI text-embedding-ada-002
- Sentence Transformers
- Hugging Face embedding models
- Custom fine-tuned embeddings

## Usage Examples

### Creating a Memory

```javascript
// Create a memory about user preferences
await tools.create_memory({
  workingDirectory: "/my/project",
  content: "User prefers concise responses and technical explanations",
  metadata: {
    source: "conversation",
    timestamp: "2024-01-15T10:30:00Z"
  },
  agentId: "assistant-1",
  category: "user_preferences",
  importance: 9
});
```

### Searching Memories

```javascript
// Search for memories about user preferences
const results = await tools.search_memories({
  workingDirectory: "/my/project",
  query: "how does the user like responses",
  limit: 5,
  threshold: 0.1,  // Adjusted for basic embeddings
  category: "user_preferences"
});
```

## 🧠 **Understanding Embeddings & Similarity Scoring**

### **Current Implementation: TF-IDF + SVD (LSA) Embeddings**

✅ **Production Quality**: This system uses **TF-IDF + SVD (Latent Semantic Analysis)** embeddings that provide genuine semantic understanding and high-quality similarity scores.

#### **What Our TF-IDF + SVD Embeddings Do:**
- **Semantic Understanding**: Captures relationships between "TypeScript" and "JavaScript", "API" and "endpoint"
- **Technical Content**: Excellent with programming concepts, code patterns, and technical documentation
- **Term Importance**: Uses TF-IDF to weight important vs common terms appropriately
- **Latent Topics**: SVD finds hidden semantic topics like "frontend", "backend", "performance"
- **Cross-Domain Matching**: Connects related concepts across different technical domains

#### **Key Advantages:**
- **Real Semantic Similarity**: Understands that "database optimization" relates to "query performance"
- **Technical Terminology**: Recognizes relationships in code, APIs, frameworks, and development concepts
- **Quality Scores**: Produces meaningful similarity scores in the 0.3-0.8 range
- **Zero External Dependencies**: No API calls required - pure TypeScript implementation
- **Deterministic Results**: Consistent embeddings for the same content

### **Similarity Scoring Algorithm**

Our system converts LanceDB's distance scores to similarity percentages:

```typescript
// Current implementation (v1.3.0+) - Optimized for TF-IDF + SVD
similarity = Math.exp(-distance * 1.0)

// This provides:
// - Always positive scores (0.0 to 1.0)
// - Higher similarity scores for quality embeddings
// - Realistic similarity percentages (0.3-0.8 range)
// - Better threshold behavior
```

### **🎯 Similarity Thresholds Guide**

#### **With TF-IDF + SVD Embeddings (Current Implementation)**
```javascript
// Recommended thresholds for TF-IDF + SVD embeddings
const thresholds = {
  strict: 0.5,       // 50% - Only very similar content
  moderate: 0.3,     // 30% - Reasonably related content (DEFAULT)
  loose: 0.2,        // 20% - Broadly related content
  veryLoose: 0.1     // 10% - Any potential relationship
};

// Example usage - threshold is optional (defaults to 0.3)
const results = await search_memories_Agentic_Tools({
  query: "user preferences",
  // threshold: 0.3,  // Optional - uses 0.3 default
  limit: 5
});

// Or specify custom threshold
const strictResults = await search_memories_Agentic_Tools({
  query: "user preferences",
  threshold: 0.5,   // Stricter similarity requirement
  limit: 5
});
```

#### **Expected Similarity Scores with TF-IDF + SVD:**
- **50-80%**: Excellent similarity for highly related content
- **30-50%**: Good similarity for related concepts (default threshold range)
- **20-30%**: Moderate similarity for loosely related content
- **< 20%**: Low similarity

### **📊 Corpus Size & Quality Guidelines**

The TF-IDF + SVD implementation's performance scales with corpus size:

#### **Corpus Size Recommendations:**
```javascript
// Corpus quality levels based on memory count
const corpusQuality = {
  minimal: "< 5 memories",    // Basic functionality only
  basic: "5-9 memories",      // Limited semantic understanding
  good: "10-19 memories",     // Meaningful relationships emerge
  optimal: "20-49 memories",  // Excellent topic discovery
  excellent: "50+ memories"   // Robust semantic understanding
};
```

#### **Performance by Corpus Size:**

**🔴 Minimal (< 5 memories):**
- Limited semantic understanding
- TF-IDF only (SVD not applied)
- Similarity scores may be less meaningful
- **Recommendation**: Add more memories for better results

**🟡 Basic (5-9 memories):**
- Basic semantic relationships
- SVD begins to work with sufficient vocabulary
- Some cross-domain matching
- **Recommendation**: Aim for 10+ memories

**🟢 Good (10-19 memories):**
- Meaningful semantic relationships
- Good cross-domain concept matching
- Reliable similarity scoring
- **Recommendation**: Excellent for most use cases

**🔵 Optimal (20-49 memories):**
- Excellent topic discovery
- Strong semantic understanding
- Robust similarity scoring
- **Recommendation**: Ideal for production use

**🟣 Excellent (50+ memories):**
- Maximum semantic understanding
- Rich topic modeling
- Highly accurate similarity scores
- **Recommendation**: Best possible performance

### **🚀 Further Enhancement Options**

The current TF-IDF + SVD implementation provides excellent semantic understanding. For even better results, consider:

#### **Recommended Embedding Models:**
1. **OpenAI**: `text-embedding-3-small` or `text-embedding-ada-002`
2. **Sentence Transformers**: `all-MiniLM-L6-v2` or `all-mpnet-base-v2`
3. **Cohere**: `embed-english-v3.0`
4. **Google**: Universal Sentence Encoder

#### **Advanced Embedding Thresholds (with transformer models):**
```javascript
const advancedThresholds = {
  strict: 0.85,      // 85% - Very high semantic similarity
  moderate: 0.75,    // 75% - Good semantic similarity
  loose: 0.65,       // 65% - Moderate semantic similarity
  veryLoose: 0.50    // 50% - Basic semantic relationship
};
```

### **🔧 Current vs Advanced Embeddings**

**Current TF-IDF + SVD (v1.3.0+):**
- ✅ Excellent semantic understanding for technical content
- ✅ Zero external API dependencies
- ✅ Fast, deterministic, offline-capable
- ✅ Realistic thresholds (0.2-0.5 range)
- ✅ Perfect for LLM memory retrieval use cases

**Advanced Transformer Models:**
- 🚀 Even better semantic understanding
- 🚀 Multilingual support
- 🚀 Higher similarity scores (0.7-0.9 range)
- ⚠️ Requires external APIs or large model downloads
- ⚠️ Higher computational requirements

### Listing Memories

```javascript
// List all memories for a specific agent
const memories = await tools.list_memories({
  workingDirectory: "/my/project",
  agentId: "assistant-1",
  limit: 20
});
```

## Best Practices

1. **Content Quality**: Write clear, descriptive memory content for better search results
2. **Categorization**: Use consistent categories to organize memories effectively
3. **Importance Scoring**: Use importance scores (1-10) to prioritize critical memories
4. **Metadata**: Include relevant metadata for better filtering and context
5. **Regular Cleanup**: Periodically review and delete outdated memories
6. **Search Optimization**: Adjust similarity thresholds based on your use case
7. **Agent Organization**: Use consistent agent IDs for multi-agent scenarios
8. **Batch Operations**: Consider batch creation for large memory sets
9. **Threshold Tuning**: Default 0.3 threshold works well for TF-IDF + SVD (0.7+ for transformer models)
10. **Content Length**: Keep memory content focused and concise for better embeddings

## Error Handling

The system provides comprehensive error handling for:
- Invalid input validation
- Database connection issues
- Embedding generation failures
- File system permissions
- Memory not found scenarios

## Performance Considerations

- **Embedding Generation**: Simple local embeddings for fast processing (no external API calls)
- **Vector Search**: LanceDB optimized for similarity search performance
- **Storage**: File-based storage for reliability and portability
- **Indexing**: Automatic vector indexing for fast retrieval
- **Memory Usage**: Efficient memory management for large datasets
- **Scalability**: Handles thousands of memories with sub-second search times
- **Concurrency**: Thread-safe operations for multi-agent scenarios

### Performance Tips

1. **Batch Operations**: Create multiple memories in batches when possible
2. **Threshold Optimization**: Use appropriate similarity thresholds to limit results
3. **Category Filtering**: Use category filters to narrow search scope
4. **Regular Maintenance**: Periodically clean up old or irrelevant memories
5. **Memory Limits**: Set reasonable limits on search results (default: 10)

## Troubleshooting

### Common Issues

**"Database not initialized"**
- Ensure `initialize()` is called before using storage operations
- Check that the working directory exists and is writable

**"Vector search returns no results"**
- Check corpus size - you may need more memories (10+ recommended for good results)
- Lower the similarity threshold (try 0.2, 0.1, or 0.05 for TF-IDF + SVD)
- Verify that the query content is meaningful and matches your memory topics
- Ensure sufficient corpus size for optimal SVD performance (falls back to TF-IDF gracefully)
- Default threshold is 0.3 - much more realistic than previous 0.1 with hash embeddings

**"Memory not found"**
- Verify the memory ID is correct
- Check that the memory wasn't deleted
- Ensure you're using the correct working directory

## Integration

The agent memories feature integrates seamlessly with existing MCP tools and follows the same patterns as the task management system. It can be used alongside project, task, and subtask management for comprehensive agent capabilities.

### Integration Examples

```javascript
// Use with task management
const project = await create_project({...});
await create_memory({
  content: `Working on project: ${project.name}`,
  category: "project_context",
  metadata: { projectId: project.id }
});

// Cross-reference memories with tasks
const memories = await search_memories({
  query: "project requirements",
  category: "project_context"
});
```
