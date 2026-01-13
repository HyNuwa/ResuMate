import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { OpenAIEmbeddings } from "@langchain/openai";
import { pool } from '../../../config/database';

// Gemini Embeddings via OpenRouter (OpenAI-compatible)
const embeddings = new OpenAIEmbeddings({
  modelName: "google/gemini-embedding-001",
  apiKey: process.env.OPENROUTER_API_KEY,
  configuration: {
    baseURL: "https://openrouter.ai/api/v1",
  },
  dimensions: 768, // Optimized for storage/performance
});

/**
 * Almacena un CV con sus embeddings en PostgreSQL
 */
export async function storeResumeWithEmbeddings(resumeText: string, fileName: string, userId: string = 'anonymous'): Promise<number> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    console.log('💾 Storing resume with embeddings...');
    
    // 1. Guardar CV original
    const resumeResult = await client.query(
      `INSERT INTO resumes (user_id, original_text, file_name, file_size) 
       VALUES ($1, $2, $3, $4) 
       RETURNING id`,
      [userId, resumeText, fileName, resumeText.length]
    );
    const resumeId = resumeResult.rows[0].id;
    
    // 2. Dividir en chunks semánticos
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 500,
      chunkOverlap: 50,
      separators: ["\n\n", "\n", ". ", " ", ""],
    });
    
    const chunks = await splitter.createDocuments([resumeText]);
    console.log(`📦 Created ${chunks.length} chunks`);
    
    // 3. Generar embeddings y guardar en batch
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embedding = await embeddings.embedQuery(chunk.pageContent);
      
      await client.query(
        `INSERT INTO resume_chunks (resume_id, content, embedding, chunk_index, metadata) 
         VALUES ($1, $2, $3, $4, $5)`,
        [
          resumeId,
          chunk.pageContent,
          JSON.stringify(embedding),
          i,
          JSON.stringify({ length: chunk.pageContent.length })
        ]
      );
    }
    
    await client.query('COMMIT');
    console.log(`✅ Stored resume ${resumeId} with ${chunks.length} chunks`);
    
    return resumeId;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error storing resume:', error);
    throw error;
  } finally {
    client.release();
  }
}

interface RelevantChunk {
  content: string;
  similarity: string;
  index: number;
}

/**
 * Busca experiencia relevante usando similitud coseno
 */
export async function findRelevantExperience(resumeId: number, jobDescription: string, topK: number = 3): Promise<RelevantChunk[]> {
  try {
    console.log(`🔍 Searching relevant experience (top ${topK})...`);
    
    // 1. Generar embedding de la Job Description
    const queryEmbedding = await embeddings.embedQuery(jobDescription);
    
    // 2. Búsqueda vectorial con pgvector (operador <=> = cosine distance)
    const result = await pool.query(
      `SELECT 
         content, 
         chunk_index,
         1 - (embedding <=> $1::vector) as similarity
       FROM resume_chunks
       WHERE resume_id = $2
       ORDER BY embedding <=> $1::vector
       LIMIT $3`,
      [JSON.stringify(queryEmbedding), resumeId, topK]
    );
    
    const chunks = result.rows.map(row => ({
      content: row.content,
      similarity: parseFloat(row.similarity).toFixed(3),
      index: row.chunk_index,
    }));
    
    console.log(`✅ Found ${chunks.length} relevant chunks (avg similarity: ${
      (chunks.reduce((sum, c) => sum + parseFloat(c.similarity), 0) / chunks.length).toFixed(3)
    })`);
    
    return chunks;
  } catch (error) {
    console.error('RAG search error:', error);
    throw error;
  }
}

export async function saveOptimization(resumeId: number, jobDescription: string, optimizedContent: string, keywords: string[], model: string | undefined): Promise<number> {
  try {
    const result = await pool.query(
      `INSERT INTO optimizations (resume_id, job_description, optimized_content, keywords, model_used)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [resumeId, jobDescription, optimizedContent, JSON.stringify(keywords), model]
    );
    
    return result.rows[0].id;
  } catch (error) {
    console.error('Error saving optimization:', error);
    throw error;
  }
}

/**
 * NUEVO: Multi-source RAG - Combina chunks del CV del usuario con knowledge base
 */
export async function getOptimizationContext(params: {
  resumeId: number;
  resumeText: string;
  jobDescription: string;
  detectedRole: string;
  detectedSeniority?: string;
}): Promise<{
  userExperience: RelevantChunk[];
  marketCriteria: any[];
  atsBestPractices: any[];
  techTrends: any[];
}> {
  const { findRelevantCriteria, getATSBestPractices, getTechTrends } = 
    await import('../../knowledge/index.js');
  
  // 1. User CV chunks (existing RAG)
  const userExperience = await findRelevantExperience(
    params.resumeId,
    params.jobDescription,
    3
  );
  
  // 2. NUEVO: Market criteria from knowledge base
  const marketCriteria = await findRelevantCriteria({
    role: params.detectedRole,
    seniority: params.detectedSeniority,
    queryText: params.jobDescription,
    topK: 3
  });
  
  // 3. NUEVO: ATS best practices
  const atsBestPractices = await getATSBestPractices();
  
  // 4. NUEVO: Tech trends
  const techTrends = await getTechTrends();
  
  console.log(`📊 Context: ${userExperience.length} CV chunks + ${marketCriteria.length} market criteria + ${atsBestPractices.length} ATS rules + ${techTrends.length} trends`);
  
  return {
    userExperience,
    marketCriteria,
    atsBestPractices,
    techTrends
  };
}
