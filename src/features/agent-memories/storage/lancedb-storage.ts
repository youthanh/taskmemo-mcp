import { promises as fs } from 'fs';
import { join } from 'path';
import * as lancedb from '@lancedb/lancedb';
import natural from 'natural';
import { SVD } from 'svd-js';
import { MemoryStorage } from './storage.js';
import { Memory, SearchMemoryInput, MemorySearchResult, MemoryConfig, DEFAULT_MEMORY_CONFIG } from '../models/memory.js';

const { TfIdf } = natural;

/**
 * TF-IDF + SVD (LSA) embedding function for semantic text understanding
 *
 * This implementation provides much better semantic similarity than basic hash embeddings.
 * It uses Term Frequency-Inverse Document Frequency (TF-IDF) to capture term importance,
 * then applies Singular Value Decomposition (SVD) to find latent semantic topics.
 *
 * Benefits:
 * - Understands semantic relationships between terms
 * - Captures latent topics and concepts
 * - Works well with technical content and code
 * - Provides meaningful similarity scores (0.2-0.6 range)
 *
 * Corpus Size Recommendations:
 * - Minimum: 5+ memories for basic functionality
 * - Good: 10+ memories for meaningful semantic relationships
 * - Optimal: 20+ memories for excellent topic discovery
 * - Large: 50+ memories for robust semantic understanding
 *
 * For even better results, consider upgrading to:
 * - OpenAI text-embedding-3-small or text-embedding-ada-002
 * - Sentence Transformers (all-MiniLM-L6-v2, all-mpnet-base-v2)
 * - Cohere embed-english-v3.0
 */
class TfIdfSvdEmbeddingFunction {
  private dimension: number;
  private corpus: string[] = [];
  private tfidf: any = null; // Use any for CommonJS module compatibility
  private vocabulary: string[] = [];
  private svdU: number[][] | null = null;
  private isInitialized = false;

  constructor(dimension: number = 200) {
    this.dimension = dimension;
  }

  /**
   * Initialize or update the embedding model with a corpus of documents
   */
  async initializeCorpus(documents: string[]): Promise<void> {
    if (documents.length === 0) {
      throw new Error('Cannot initialize with empty corpus');
    }

    this.corpus = documents;
    this.tfidf = new TfIdf();

    // Add all documents to TF-IDF
    documents.forEach(doc => {
      this.tfidf!.addDocument(doc.toLowerCase());
    });

    // Extract vocabulary
    const vocabSet = new Set<string>();
    this.tfidf.documents.forEach((doc: any) => {
      Object.keys(doc).forEach(term => vocabSet.add(term));
    });
    this.vocabulary = Array.from(vocabSet);

    // Build TF-IDF matrix [nDocs × vocabSize]
    const tfidfMatrix = documents.map((_, docIdx) =>
      this.vocabulary.map(term => this.tfidf!.tfidf(term, docIdx))
    );

    // Apply SVD if we have enough documents relative to vocabulary size
    // SVD requires m >= n (documents >= vocabulary terms)
    if (tfidfMatrix.length > 0 && this.vocabulary.length > 0 &&
        tfidfMatrix.length >= Math.min(this.vocabulary.length, 50)) {
      try {
        // Transpose matrix for SVD: [vocabSize × nDocs]
        const transposedMatrix = this.vocabulary.map((_, termIdx) =>
          tfidfMatrix.map(docVec => docVec[termIdx])
        );

        const { u } = SVD(transposedMatrix);
        this.svdU = u;
        this.isInitialized = true;
      } catch (error) {
        console.warn('SVD failed, falling back to TF-IDF only:', error);
        this.svdU = null;
        this.isInitialized = true;
      }
    } else {
      // Not enough documents for SVD, use TF-IDF only
      this.svdU = null;
      this.isInitialized = true;
    }
  }

  /**
   * Generate embedding for a single text document
   */
  async embed(text: string): Promise<number[]> {
    if (!this.isInitialized || !this.tfidf) {
      // If not initialized, create a minimal corpus with just this text
      await this.initializeCorpus([text]);
      // For single document corpus, return a simple normalized vector
      const words = text.toLowerCase().split(/\s+/);
      const embedding = new Array(this.dimension).fill(0);
      words.forEach((word, i) => {
        const index = i % this.dimension;
        embedding[index] += 1.0;
      });
      const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
      return magnitude > 0 ? embedding.map(x => x / magnitude) : embedding;
    }

    // Use the existing TF-IDF model to get term frequencies for the new text
    const words = text.toLowerCase().split(/\s+/);

    // Extend vocabulary to include new terms from this document
    const newTerms = words.filter(word => !this.vocabulary.includes(word));
    const extendedVocabulary = [...this.vocabulary, ...newTerms];

    const termFreq: Record<string, number> = {};
    words.forEach(word => {
      termFreq[word] = (termFreq[word] || 0) + 1;
    });

    // Calculate TF-IDF vector using the extended vocabulary and consistent IDF calculation
    // Include the current document in the corpus for IDF calculation
    const extendedCorpus = [...this.corpus, text.toLowerCase()];

    const tfidfVector = extendedVocabulary.map(term => {
      const tf = (termFreq[term] || 0) / words.length;

      // Calculate IDF including the current document in the corpus
      const docsWithTerm = extendedCorpus.filter(doc =>
        doc.split(/\s+/).includes(term)
      ).length;

      const idf = docsWithTerm > 0 ? Math.log(extendedCorpus.length / docsWithTerm) : 0;
      return tf * idf;
    });

    let embedding: number[];

    if (this.svdU && this.svdU.length > 0) {
      // Project using SVD (LSA)
      const nComponents = Math.min(this.dimension, this.svdU[0].length);
      embedding = new Array(nComponents).fill(0);

      // Matrix multiplication: tfidfVector × svdU^T
      for (let i = 0; i < nComponents; i++) {
        for (let j = 0; j < Math.min(tfidfVector.length, this.svdU.length); j++) {
          if (this.svdU[j] && this.svdU[j][i] !== undefined) {
            embedding[i] += tfidfVector[j] * this.svdU[j][i];
          }
        }
      }
    } else {
      // Fallback to truncated TF-IDF
      embedding = tfidfVector.slice(0, this.dimension);
    }

    // Pad or truncate to exact dimension
    if (embedding.length < this.dimension) {
      embedding = embedding.concat(new Array(this.dimension - embedding.length).fill(0));
    } else if (embedding.length > this.dimension) {
      embedding = embedding.slice(0, this.dimension);
    }

    // L2 normalize
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      embedding = embedding.map(x => x / magnitude);
    }

    return embedding;
  }

  /**
   * Update the corpus with new documents (for incremental learning)
   */
  async updateCorpus(newDocuments: string[]): Promise<void> {
    const allDocuments = [...this.corpus, ...newDocuments];
    await this.initializeCorpus(allDocuments);
  }

  /**
   * Get corpus statistics and recommendations
   */
  getStats(): {
    corpusSize: number;
    vocabularySize: number;
    isInitialized: boolean;
    quality: 'minimal' | 'basic' | 'good' | 'optimal' | 'excellent';
    recommendation: string;
  } {
    const size = this.corpus.length;
    let quality: 'minimal' | 'basic' | 'good' | 'optimal' | 'excellent';
    let recommendation: string;

    if (size < 5) {
      quality = 'minimal';
      recommendation = 'Add more memories (5+ recommended) for basic semantic understanding';
    } else if (size < 10) {
      quality = 'basic';
      recommendation = 'Add more memories (10+ recommended) for meaningful semantic relationships';
    } else if (size < 20) {
      quality = 'good';
      recommendation = 'Good corpus size. Consider adding more memories (20+) for optimal topic discovery';
    } else if (size < 50) {
      quality = 'optimal';
      recommendation = 'Excellent corpus size for semantic understanding';
    } else {
      quality = 'excellent';
      recommendation = 'Large corpus provides robust semantic understanding';
    }

    return {
      corpusSize: size,
      vocabularySize: this.vocabulary.length,
      isInitialized: this.isInitialized,
      quality,
      recommendation
    };
  }
}

/**
 * LanceDB-based storage implementation for agent memories
 */
export class LanceDBMemoryStorage implements MemoryStorage {
  private workingDirectory: string;
  private storageDir: string;
  private dbPath: string;
  private db: lancedb.Connection | null = null;
  private table: lancedb.Table | null = null;
  private embeddingFunction: TfIdfSvdEmbeddingFunction;
  private config: MemoryConfig;
  private corpusNeedsUpdate = true;

  constructor(workingDirectory: string, config: Partial<MemoryConfig> = {}) {
    this.workingDirectory = workingDirectory;
    this.storageDir = join(workingDirectory, '.agentic-tools-mcp');
    this.dbPath = join(this.storageDir, 'memories');
    this.config = { ...DEFAULT_MEMORY_CONFIG, ...config };
    this.embeddingFunction = new TfIdfSvdEmbeddingFunction(this.config.embeddingDimension);
  }

  /**
   * Initialize the LanceDB storage system
   */
  async initialize(): Promise<void> {
    try {
      // Validate that working directory exists
      await fs.access(this.workingDirectory);
    } catch (error) {
      throw new Error(`Working directory does not exist or is not accessible: ${this.workingDirectory}`);
    }

    try {
      // Ensure .agentic-tools-mcp directory exists
      await fs.mkdir(this.storageDir, { recursive: true });

      // Connect to LanceDB
      this.db = await lancedb.connect(this.dbPath);

      // Try to open existing table or create new one
      try {
        this.table = await this.db.openTable('agent_memories');
      } catch (error) {
        // Table doesn't exist, create it
        await this.createTable();
      }
    } catch (error) {
      throw new Error(`Failed to initialize LanceDB storage: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create the agent_memories table with proper schema
   */
  private async createTable(): Promise<void> {
    if (!this.db) {
      throw new Error('Database not initialized');
    }

    try {
      // Create table with initial empty data to establish schema
      // Note: LanceDB requires metadata to be a string, not an object
      // Note: LanceDB expects vector column to be named "vector" for search
      const initialData = [{
        id: 'temp-init-record',
        content: 'temporary initialization record',
        vector: new Array(this.config.embeddingDimension).fill(0.1), // Use non-zero values for better schema detection
        metadata: '{"temp": true}', // Store as JSON string
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        agentId: 'temp-agent',
        category: 'temp-category',
        importance: 1
      }];

      this.table = await this.db.createTable('agent_memories', initialData);

      // Delete the temporary record using consistent syntax
      await this.table.delete(`id = 'temp-init-record'`);

      // Verify table is properly initialized
      await this.table.query().limit(0).toArray();

    } catch (error) {
      console.error('❌ Failed to create LanceDB table:', error);
      throw new Error(`Failed to create agent_memories table: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Ensure table is available
   */
  private ensureTable(): lancedb.Table {
    if (!this.table) {
      throw new Error('Storage not initialized. Call initialize() first.');
    }
    return this.table;
  }

  /**
   * Update the embedding corpus with all existing memories
   */
  private async updateEmbeddingCorpus(): Promise<void> {
    if (!this.corpusNeedsUpdate) {
      return;
    }

    try {
      const memories = await this.getMemories();
      const documents = memories.map(m => m.content);

      if (documents.length > 0) {
        await this.embeddingFunction.initializeCorpus(documents);
        this.corpusNeedsUpdate = false;
      }
    } catch (error) {
      console.warn('Failed to update embedding corpus:', error);
      // Continue with individual embeddings if corpus update fails
    }
  }

  /**
   * Generate embedding for content if needed
   */
  private async generateEmbedding(content: string): Promise<number[]> {
    if (!this.config.autoEmbedding) {
      return new Array(this.config.embeddingDimension).fill(0);
    }

    // Update corpus if needed
    await this.updateEmbeddingCorpus();

    return await this.embeddingFunction.embed(content);
  }

  /**
   * Convert LanceDB distance to similarity score
   * LanceDB uses L2 (Euclidean) distance by default
   * For L2: distance ranges from 0 to ∞, where 0 = identical
   *
   * Optimized for TF-IDF + SVD embeddings which produce better semantic relationships
   */
  private convertDistanceToSimilarity(distance: number): number {
    // For TF-IDF + SVD embeddings, use a gentler decay factor
    // This allows for higher similarity scores with better embeddings
    const decayFactor = 1.0; // Reduced from 2.0 for better TF-IDF + SVD scores
    return Math.exp(-distance * decayFactor);
  }

  /**
   * Get all memories with optional filtering
   */
  async getMemories(agentId?: string, category?: string, limit?: number): Promise<Memory[]> {
    const table = this.ensureTable();

    try {
      // Use query() instead of search() for non-vector queries
      let query = table.query();

      // Apply filters (LanceDB query() - try different syntax for agentId)
      const filters: string[] = [];
      if (agentId) {
        // Try using backticks instead of quotes for camelCase columns
        filters.push(`\`agentId\` = '${agentId}'`);
      }
      if (category) {
        filters.push(`category = '${category}'`);
      }

      if (filters.length > 0) {
        const filterString = filters.join(' AND ');
        // Note: Using backticks for camelCase column names in LanceDB SQL queries
        query = query.where(filterString);
      }

      query = query.limit(limit || 1000);

      const results = await query.toArray();

      return results.map(this.mapResultToMemory);
    } catch (error) {
      console.error('❌ Error in getMemories:', error);
      throw new Error(`Failed to get memories: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get a specific memory by ID
   */
  async getMemory(id: string): Promise<Memory | null> {
    const table = this.ensureTable();

    try {
      const results = await table.query()
        .where(`id = '${id}'`)
        .limit(1)
        .toArray();

      if (results.length === 0) {
        return null;
      }

      return this.mapResultToMemory(results[0]);
    } catch (error) {
      console.error('❌ Error in getMemory:', error);
      throw new Error(`Failed to get memory by ID: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Map LanceDB result to Memory object
   */
  private mapResultToMemory(result: any): Memory {
    try {
      return {
        id: result.id,
        content: result.content,
        embedding: result.vector, // Map 'vector' column back to 'embedding' property
        metadata: typeof result.metadata === 'string' ? JSON.parse(result.metadata) : result.metadata,
        createdAt: result.createdAt,
        updatedAt: result.updatedAt,
        agentId: result.agentId,
        category: result.category,
        importance: result.importance,
      };
    } catch (error) {
      console.error('❌ Error mapping result to memory:', error);
      throw new Error(`Failed to map LanceDB result to Memory: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create a new memory
   */
  async createMemory(memory: Memory): Promise<Memory> {
    const table = this.ensureTable();

    // Generate embedding if not provided
    if (!memory.embedding && this.config.autoEmbedding) {
      memory.embedding = await this.generateEmbedding(memory.content);
    }

    // Prepare data for LanceDB
    const data = [{
      id: memory.id,
      content: memory.content,
      vector: memory.embedding || new Array(this.config.embeddingDimension).fill(0), // Use 'vector' column name
      metadata: JSON.stringify(memory.metadata),
      createdAt: memory.createdAt,
      updatedAt: memory.updatedAt,
      agentId: memory.agentId || '',
      category: memory.category || '',
      importance: memory.importance || 1,
    }];

    await table.add(data);

    // Mark corpus for update since we added new content
    this.corpusNeedsUpdate = true;

    return memory;
  }

  /**
   * Update an existing memory
   */
  async updateMemory(id: string, updates: Partial<Memory>): Promise<Memory | null> {
    const existingMemory = await this.getMemory(id);
    if (!existingMemory) {
      return null;
    }

    // Merge updates
    const updatedMemory: Memory = {
      ...existingMemory,
      ...updates,
      id: existingMemory.id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString(),
    };

    // Regenerate embedding if content changed
    if (updates.content && this.config.autoEmbedding) {
      updatedMemory.embedding = await this.generateEmbedding(updatedMemory.content);
    }

    // Delete old record and insert updated one
    await this.deleteMemory(id);
    await this.createMemory(updatedMemory);

    // Mark corpus for update since content may have changed
    this.corpusNeedsUpdate = true;

    return updatedMemory;
  }

  /**
   * Delete a memory
   */
  async deleteMemory(id: string): Promise<boolean> {
    const table = this.ensureTable();

    try {
      await table.delete(`id = '${id}'`);
      // Mark corpus for update since we removed content
      this.corpusNeedsUpdate = true;
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Search memories by semantic similarity
   */
  async searchMemories(input: SearchMemoryInput): Promise<MemorySearchResult[]> {
    const table = this.ensureTable();

    let queryVector: number[];

    if (typeof input.query === 'string') {
      // Generate embedding for text query
      queryVector = await this.generateEmbedding(input.query);
    } else {
      // Use provided vector
      queryVector = input.query;
    }

    // Use search() method which expects the vector column to be named "vector"
    let query = table.search(queryVector)
      .limit(input.limit || this.config.defaultLimit);

    // Apply filters (search() method - try backticks for agentId)
    const filters: string[] = [];
    if (input.agentId) {
      filters.push(`\`agentId\` = '${input.agentId}'`);
    }
    if (input.category) {
      filters.push(`category = '${input.category}'`);
    }
    if (input.minImportance) {
      filters.push(`importance >= ${input.minImportance}`);
    }

    if (filters.length > 0) {
      query = query.where(filters.join(' AND '));
    }

    const results = await query.toArray();

    const mappedResults = results
      .map((result: any) => ({
        memory: this.mapResultToMemory(result),
        score: this.convertDistanceToSimilarity(result._distance || 0),
        distance: result._distance || 0,
      }));

    const threshold = input.threshold || this.config.defaultThreshold;

    return mappedResults.filter(result => result.score >= threshold);
  }

  /**
   * Delete all memories for a specific agent
   */
  async deleteMemoriesByAgent(agentId: string): Promise<number> {
    const table = this.ensureTable();

    // Get count before deletion
    const memories = await this.getMemories(agentId);
    const count = memories.length;

    if (count > 0) {
      await table.delete(`\`agentId\` = '${agentId}'`);
    }

    return count;
  }

  /**
   * Get embedding corpus statistics and quality assessment
   */
  getCorpusStatistics(): {
    corpusSize: number;
    vocabularySize: number;
    isInitialized: boolean;
    quality: 'minimal' | 'basic' | 'good' | 'optimal' | 'excellent';
    recommendation: string;
  } {
    return this.embeddingFunction.getStats();
  }

  /**
   * Get memory statistics
   */
  async getStatistics(): Promise<{
    totalMemories: number;
    memoriesByAgent: Record<string, number>;
    memoriesByCategory: Record<string, number>;
    oldestMemory?: string;
    newestMemory?: string;
    corpus: {
      size: number;
      quality: string;
      recommendation: string;
    };
  }> {
    const memories = await this.getMemories();

    const stats = {
      totalMemories: memories.length,
      memoriesByAgent: {} as Record<string, number>,
      memoriesByCategory: {} as Record<string, number>,
      oldestMemory: undefined as string | undefined,
      newestMemory: undefined as string | undefined,
      corpus: {
        size: 0,
        quality: 'minimal',
        recommendation: 'Add memories to improve semantic understanding'
      }
    };

    if (memories.length === 0) {
      // Add corpus statistics even for empty case
      const corpusStats = this.getCorpusStatistics();
      stats.corpus = {
        size: corpusStats.corpusSize,
        quality: corpusStats.quality,
        recommendation: corpusStats.recommendation
      };
      return stats;
    }

    // Calculate statistics
    let oldest = memories[0];
    let newest = memories[0];

    for (const memory of memories) {
      // Count by agent
      const agent = memory.agentId || 'unknown';
      stats.memoriesByAgent[agent] = (stats.memoriesByAgent[agent] || 0) + 1;

      // Count by category
      const category = memory.category || 'uncategorized';
      stats.memoriesByCategory[category] = (stats.memoriesByCategory[category] || 0) + 1;

      // Find oldest and newest
      if (new Date(memory.createdAt) < new Date(oldest.createdAt)) {
        oldest = memory;
      }
      if (new Date(memory.createdAt) > new Date(newest.createdAt)) {
        newest = memory;
      }
    }

    stats.oldestMemory = oldest.createdAt;
    stats.newestMemory = newest.createdAt;

    // Update corpus statistics
    const corpusStats = this.getCorpusStatistics();
    stats.corpus = {
      size: corpusStats.corpusSize,
      quality: corpusStats.quality,
      recommendation: corpusStats.recommendation
    };

    return stats;
  }
}
