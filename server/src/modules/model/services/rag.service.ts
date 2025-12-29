import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import { pool } from '../../../config/database';

// Usando HuggingFace con modelo BGE-M3 optimizado para RAG multilingüe
// Debug: verificar que el token se está leyendo
const hfApiKey = process.env.HUGGINGFACE_API_KEY || "hf_demo";
console.log('🔑 HuggingFace API Key:', hfApiKey ? `${hfApiKey.substring(0, 10)}...` : 'NOT SET');

const embeddings = new HuggingFaceInferenceEmbeddings({
  model: "BAAI/bge-m3", // 1024 dimensiones, mejor para español+inglés híbrido
  apiKey: hfApiKey,
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

/**
 * Guarda una optimización en la DB
 */
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
